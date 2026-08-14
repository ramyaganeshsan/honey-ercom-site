const {
  getMessage,
  getCurrentTimestamp,
  currencyFormatter,
} = require("../utils");
const { PRODUCT_THUMP_DISPLAY_IMAGE } = require("../utils/constants");
const logger = require("../utils/logger");
const {
  findOne,
  findAll,
  create,
  updateOne,
  getModel,
} = require("../mongo/repo");

const byIdMap = (rows, key) => {
  const map = {};
  for (const row of rows || []) {
    map[row[key]] = row;
  }
  return map;
};

exports.getCartIds = async (userId, limit = 5) => {
  const carts = await findAll(
    "cart",
    { user_id: Number(userId), cart_transaction_status: 1 },
    {
      attributes: ["cart_id"],
      order: [["cart_id", "DESC"]],
      limit: Number(limit) || 5,
    }
  );
  return carts;
};

exports.getMyOrderDetails = async (ids) => {
  const cartIds = (ids || [])
    .toString()
    .split(",")
    .map((id) => Number(id))
    .filter((id) => !isNaN(id));

  // Support both array and CSV string as original SQL used IN (${ids})
  const normalizedIds = Array.isArray(ids)
    ? ids.map((id) => Number(id)).filter((id) => !isNaN(id))
    : cartIds;

  if (!normalizedIds.length) return [];

  const carts = await findAll(
    "cart",
    { cart_id: { $in: normalizedIds } },
    {
      order: [["transaction_id", "DESC"]],
    }
  );
  if (!carts.length) return [];

  const items = await findAll("cart_items", {
    cart_id: { $in: carts.map((c) => c.cart_id) },
  });
  const subProductIds = [
    ...new Set(items.map((i) => Number(i.sub_product_id)).filter((id) => !isNaN(id))),
  ];
  const subProducts = subProductIds.length
    ? await findAll("sub_products", { id: { $in: subProductIds } })
    : [];
  const productIds = [
    ...new Set(subProducts.map((s) => Number(s.product_id)).filter((id) => !isNaN(id))),
  ];
  const products = productIds.length
    ? await findAll(
        "product",
        { deal_id: { $in: productIds } },
        { attributes: ["deal_id", "deal_title", "deal_title_french"] }
      )
    : [];

  const cartMap = byIdMap(carts, "cart_id");
  const subMap = byIdMap(subProducts, "id");
  const productMap = byIdMap(products, "deal_id");

  const rows = items.map((item) => {
    const cart = cartMap[item.cart_id] || {};
    const sub = subMap[item.sub_product_id] || {};
    const product = productMap[sub.product_id] || {};
    // Prefer cart-level admin_status (set by admin panel) when syncing to storefront
    const cartAdmin = Number(cart.admin_status);
    const itemDelivery = Number(item.delivery_status);
    const mappedFromCart =
      Number.isFinite(cartAdmin) && cartAdmin > 0
        ? (() => {
            switch (cartAdmin) {
              case 1:
                return { admin_status: 1, delivery_status: itemDelivery || 1 };
              case 2:
                return { admin_status: 1, delivery_status: 2 };
              case 3:
                return { admin_status: 1, delivery_status: 4 };
              case 4:
                return { admin_status: 1, delivery_status: 6 };
              default:
                return null;
            }
          })()
        : null;
    return {
      cart_id: cart.cart_id,
      transaction_id: cart.transaction_id,
      DHL_shipmet_trackingID: cart.DHL_shipmet_trackingID,
      total_cart_price: cart.total_cart_price,
      transaction_date: cart.transaction_date,
      grand_total_price: cart.grand_total_price,
      item_id: item.item_id,
      is_cancel: cart.is_cancel,
      sub_product_id: item.sub_product_id,
      deal_title: product.deal_title,
      deal_title_french: product.deal_title_french,
      deal_value: item.deal_value,
      delivery_status:
        mappedFromCart?.delivery_status ?? item.delivery_status,
      admin_status: mappedFromCart?.admin_status ?? item.admin_status,
      cart_admin_status: Number.isFinite(cartAdmin) ? cartAdmin : 0,
      dealID: item.deal_id,
      quantity: item.item_quantity,
      sizeId: sub.size_id,
    };
  });

  rows.sort(
    (a, b) => Number(b.transaction_id || 0) - Number(a.transaction_id || 0)
  );
  return rows;
};

exports.cancelMyOrder = async (
  cartId,
  orderId,
  cancellationReason,
  userDetails
) => {
  try {
    const cart = await findOne("cart", {
      cart_id: Number(cartId),
      transaction_id: Number(orderId),
      cart_transaction_status: 1,
      user_id: Number(userDetails.user_id),
    });
    if (!cart) {
      return { status: 0, message: getMessage("order_not_found") };
    }

    const items = await findAll("cart_items", { cart_id: Number(cartId) });
    if (!items.length) {
      return { status: 0, message: getMessage("order_not_found") };
    }

    const cartDetails = items.map((item) => ({
      delivery_status: item.delivery_status,
      item_quantity: item.item_quantity,
      deal_value: item.deal_value,
      deal_id: item.deal_id,
      sub_product_id: item.sub_product_id,
      user_id: cart.user_id,
      item_id: item.item_id,
      cart_id: item.cart_id,
      is_cancel: cart.is_cancel,
      transaction_id: cart.transaction_id,
      cart_transaction_status: cart.cart_transaction_status,
    }));

    let cartPromise = [];
    for (let i = 0; i < cartDetails.length; i++) {
      let cartDetail = cartDetails[i];
      if (cartDetail?.delivery_status != 6) {
        cartPromise.push(
          updateCancelStatusAndInsertCancelOrderLog(
            cartDetail,
            cancellationReason
          )
        );
      }
    }

    await Promise.all(cartPromise);
    return { status: 1 };
  } catch (err) {
    console.log(err);
    logger.error(err);
    return { status: 0, message: "" };
  }
};

const updateCancelStatusAndInsertCancelOrderLog = async (
  cartDetails,
  cancellationReason
) => {
  await Promise.all([
    updateOne(
      "cart_items",
      { item_id: Number(cartDetails.item_id) },
      {
        delivery_status: 6,
        shipping_date: getCurrentTimestamp(),
        admin_status: 1,
      }
    ),
    create("order_cancel", {
      product_id: Number(cartDetails.deal_id),
      user_id: Number(cartDetails.user_id),
      transaction_id: Number(cartDetails.transaction_id),
      cart_id: Number(cartDetails.cart_id),
      cart_item_id: Number(cartDetails.item_id),
      quantity: String(cartDetails.item_quantity),
      amount: String(
        currencyFormatter(cartDetails.item_quantity * cartDetails.deal_value)
      ),
      reason: String(cancellationReason || "").replace(/[']+/g, " "),
      cancel_process: 2,
      process_type: 0,
      cancel_approved_by: 1,
      cancel_type: 1,
      cancel_status: 1,
      cancelled_on: getCurrentTimestamp(),
      payment_type: 0,
    }),
    getModel("cart").updateOne(
      { cart_id: Number(cartDetails.cart_id) },
      {
        $inc: {
          cancel_amount: currencyFormatter(
            cartDetails.item_quantity * cartDetails.deal_value
          ),
        },
        $set: { is_cancel: 1 },
      }
    ),
  ]);
};

exports.getOrderDetails = async (transactionId) => {
  try {
    const cart = await findOne("cart", {
      transaction_id: Number(transactionId),
    });
    if (!cart) return [];

    const items = await findAll(
      "cart_items",
      { cart_id: cart.cart_id },
      { order: [["item_id", "DESC"]] }
    );
    if (!items.length) return [];

    const subProductIds = [
      ...new Set(
        items.map((i) => Number(i.sub_product_id)).filter((id) => !isNaN(id))
      ),
    ];
    const dealIds = [
      ...new Set(items.map((i) => Number(i.deal_id)).filter((id) => !isNaN(id))),
    ];

    const [subProducts, products] = await Promise.all([
      subProductIds.length
        ? findAll("sub_products", { id: { $in: subProductIds } })
        : Promise.resolve([]),
      dealIds.length
        ? findAll(
            "product",
            { deal_id: { $in: dealIds }, deal_status: 1 },
            { attributes: ["deal_id", "deal_title", "deal_title_french"] }
          )
        : Promise.resolve([]),
    ]);

    const sizeIds = [
      ...new Set(
        subProducts.map((s) => Number(s.size_id)).filter((id) => !isNaN(id) && id)
      ),
    ];
    const sizes = sizeIds.length
      ? await findAll("size", { size_id: { $in: sizeIds } })
      : [];

    const subMap = byIdMap(subProducts, "id");
    const productMap = byIdMap(products, "deal_id");
    const sizeMap = byIdMap(sizes, "size_id");

    return items.map((item) => {
      const sub = subMap[item.sub_product_id] || {};
      const product = productMap[item.deal_id] || {};
      const size = sizeMap[sub.size_id] || {};
      return {
        deal_title: product.deal_title,
        deal_title_french: product.deal_title_french,
        deal_id: item.deal_id,
        deal_key: item.deal_key,
        item_quantity: item.item_quantity,
        sub_product_id: item.sub_product_id,
        currentPrice: sub.discount,
        size_id: sub.size_id,
        sku: sub.sku,
        size_name: size.size_name,
        inStock: Number(sub.quantity) > 0,
        image: `${PRODUCT_THUMP_DISPLAY_IMAGE}${item.deal_key}_1.png`,
      };
    });
  } catch (error) {
    console.error("Error fetching order details: ", error);
    throw error;
  }
};

exports.getInvoicedetails = async (orderId) => {
  const carts = await findAll("cart", {
    cart_transaction_status: 1,
    transaction_id: Number(orderId),
  });
  if (!carts.length) return [];
  const cart = carts[0];

  const items = await findAll("cart_items", { cart_id: cart.cart_id });
  const itemIds = items.map((i) => i.item_id);
  const subProductIds = [
    ...new Set(items.map((i) => Number(i.sub_product_id)).filter((id) => !isNaN(id))),
  ];

  const [
    paymentLogs,
    subProducts,
    city,
    country,
    state,
    user,
    cancels,
  ] = await Promise.all([
    findAll("hesabe_payment_log", { cart_id: cart.cart_id }),
    subProductIds.length
      ? findAll("sub_products", { id: { $in: subProductIds } })
      : Promise.resolve([]),
    cart.shipping_city
      ? findOne("city", { city_id: Number(cart.shipping_city) })
      : Promise.resolve(null),
    cart.shipping_country
      ? findOne("country", { country_id: Number(cart.shipping_country) })
      : Promise.resolve(null),
    cart.shipping_state
      ? findOne("state", { state_id: Number(cart.shipping_state) })
      : Promise.resolve(null),
    findOne(
      "users",
      { user_id: Number(cart.user_id) },
      { attributes: ["email", "user_id"] }
    ),
    itemIds.length
      ? findAll("order_cancel", { cart_item_id: { $in: itemIds } })
      : Promise.resolve([]),
  ]);

  const sizeIds = [
    ...new Set(
      subProducts.map((s) => Number(s.size_id)).filter((id) => !isNaN(id) && id)
    ),
  ];
  const sizes = sizeIds.length
    ? await findAll("size", { size_id: { $in: sizeIds } })
    : [];

  const subMap = byIdMap(subProducts, "id");
  const sizeMap = byIdMap(sizes, "size_id");
  const cancelMap = byIdMap(cancels, "cart_item_id");
  const paymentLog = paymentLogs[0] || {};

  const seen = new Set();
  const response = [];
  for (const ci of items) {
    if (seen.has(ci.item_id)) continue;
    seen.add(ci.item_id);
    const sub = subMap[ci.sub_product_id] || {};
    const size = sizeMap[sub.size_id] || {};
    const oc = cancelMap[ci.item_id] || {};

    response.push({
      ...cart,
      ...ci,
      ...sub,
      ...size,
      cityName: city?.city_name,
      delivery_charge: city?.delivery_charge,
      stateName: state?.state_name,
      countryName: country?.country_name,
      transid: cart.transaction_id,
      reason: oc.reason,
      cancel_approved_by: oc.cancel_approved_by,
      cancel_type: oc.cancel_type,
      cancel_status: oc.cancel_status,
      cancelled_on: oc.cancelled_on,
      delivery_status: ci.delivery_status,
      type: cart.type,
      coupon_code: cart.coupon_code,
      transaction_date: cart.transaction_date,
      NAME: cart.shipping_name,
      saddr1: cart.shipping_address,
      saddr2: cart.shipping_address1,
      city_name: cart.shipping_city,
      phone: cart.coupon_code, // matches original SQL alias quirk
      product_color: ci.item_color,
      product_size: ci.item_size,
      filling_option: ci.filling_option,
      filling_price: ci.filling_price,
      quantity: ci.item_quantity,
      shipping: cart.delivery_price,
      coupon_apply: cart.coupon_apply,
      email: user?.email,
      item_id: ci.item_id,
      package_number: cart.transaction_id,
      discount_amount: cart.discount_amount,
      promocode: cart.promocode_dump,
      method: paymentLog.method,
      payment_id: paymentLog.payment_id,
      delivery_period: cart.delivery_period,
      sku: ci.sku,
    });
  }
  return response;
};

exports.getTrackIdByOrderID = async (orderId) => {
  const carts = await findAll(
    "cart",
    { transaction_id: Number(orderId) },
    { attributes: ["DHL_shipmet_trackingID"] }
  );
  return carts;
};
