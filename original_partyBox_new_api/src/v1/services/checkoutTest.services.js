const {
  currencyFormatter,
  getMessage,
  getCurrentTimestamp,
  getCurrentTime,
  deserializeData,
  serializeData,
  getUserSessionDetails,
} = require("../utils");
const { PRODUCT_THUMP_DISPLAY_IMAGE } = require("../utils/constants");
const { addToCart } = require("./cart.services");
const {
  findOne,
  findAll,
  create,
  updateOne,
  deleteMany,
  count,
  getModel,
} = require("../mongo/repo");

const byIdMap = (rows, key) => {
  const map = {};
  for (const row of rows || []) {
    map[row[key]] = row;
  }
  return map;
};

exports.getUserCheckoutDetails = async (userId) => {
  const carts = await findAll("cart", {
    user_id: Number(userId),
    cart_transaction_status: { $ne: 1 },
  });
  if (!carts.length) return [];

  const cartIds = carts.map((c) => c.cart_id);
  const items = await findAll(
    "cart_items",
    { cart_id: { $in: cartIds } },
    { order: [["item_id", "DESC"]] }
  );
  if (!items.length) return [];

  const subProductIds = [
    ...new Set(items.map((i) => Number(i.sub_product_id)).filter((id) => !isNaN(id))),
  ];
  const dealIds = [
    ...new Set(items.map((i) => Number(i.deal_id)).filter((id) => !isNaN(id))),
  ];

  const [subProducts, products, user] = await Promise.all([
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
    findOne(
      "users",
      { user_id: Number(userId) },
      { attributes: ["joined_date"] }
    ),
  ]);

  const subMap = byIdMap(subProducts, "id");
  const productMap = byIdMap(products, "deal_id");

  const seen = new Set();
  const response = [];
  for (const item of items) {
    if (seen.has(item.item_id)) continue;
    seen.add(item.item_id);
    const sub = subMap[item.sub_product_id] || {};
    const product = productMap[item.deal_id] || {};
    response.push({
      deal_id: item.deal_id,
      deal_key: item.deal_key,
      cart_id: item.cart_id,
      item_id: item.item_id,
      item_quantity: item.item_quantity,
      sub_product_id: item.sub_product_id,
      currentPrice: sub.discount,
      deal_title: product.deal_title,
      deal_title_french: product.deal_title_french,
      inStock: Number(sub.quantity) > 0,
      image: `${PRODUCT_THUMP_DISPLAY_IMAGE}${item.deal_key}_1.png`,
      joined_date: user?.joined_date,
    });
  }
  return response;
};

exports.getUserAddDetails = async (userId) => {
  const user = await findOne(
    "users",
    { user_id: Number(userId), user_status: 1 },
    {
      attributes: [
        "address1",
        "city_id",
        "state_id",
        "country_id",
        "phone_number",
        "email",
        "firstname",
        "lastname",
      ],
    }
  );
  return user ? [user] : [];
};

exports.getAdminEmail = async () => {
  const settings = await findOne(
    "settings",
    {},
    { attributes: ["adminEmailAddress"] }
  );
  return settings || {};
};

exports.getCartProducts = async (cartId, userId) => {
  const cart = await findOne("cart", {
    cart_id: Number(cartId),
    user_id: Number(userId),
    cart_transaction_status: { $ne: 1 },
  });
  if (!cart) return [];

  const items = await findAll("cart_items", { cart_id: Number(cartId) });
  if (!items.length) return [];

  const subProductIds = [
    ...new Set(items.map((i) => Number(i.sub_product_id)).filter((id) => !isNaN(id))),
  ];
  const dealIds = [
    ...new Set(items.map((i) => Number(i.deal_id)).filter((id) => !isNaN(id))),
  ];

  const [subProducts, products] = await Promise.all([
    findAll("sub_products", { id: { $in: subProductIds } }),
    findAll("product", { deal_id: { $in: dealIds } }),
  ]);
  const subMap = byIdMap(subProducts, "id");
  const productMap = byIdMap(products, "deal_id");

  return items.map((item) => {
    const sub = subMap[item.sub_product_id] || {};
    const product = productMap[item.deal_id] || {};
    return {
      cart_transaction_status: item.cart_transaction_status,
      quantity: sub.quantity,
      price: sub.price,
      discount: sub.discount,
      deal_id: item.deal_id,
      total_cart_items: cart.total_cart_items,
      total_cart_price: cart.total_cart_price,
      item_quantity: item.item_quantity,
      deal_status: product.deal_status,
      deal_title: product.deal_title,
      deal_title_french: product.deal_title_french,
      sub_product_id: item.sub_product_id,
    };
  });
};

exports.getCityShippingCost = async (cityId) => {
  const city = await findOne(
    "city",
    { city_id: Number(cityId) },
    { attributes: ["delivery_charge"] }
  );
  return city ? [city] : [];
};

exports.updateCartCheckoutDetails = async (requestData) => {
  await updateCartDetails(requestData);
};

const updateCartDetails = async ({
  notes,
  shippingCost,
  finalTotal,
  name,
  phone_number,
  address,
  state,
  city,
  country,
  totalAmount,
  totalDiscount,
  cartId,
  totalTax,
  isPickupFromStore,
}) => {
  await updateOne(
    "cart",
    { cart_id: Number(cartId) },
    {
      notes: notes ? String(notes).replace(/[']+/g, " ") : "",
      delivery_type: 1,
      delivery_price: shippingCost,
      grand_total_price:
        currencyFormatter(finalTotal) + currencyFormatter(totalAmount),
      shipping_name: name ? String(name).replace(/[']+/g, " ") : "",
      shipping_address: address ? String(address).replace(/[']+/g, " ") : "",
      shipping_phone: phone_number
        ? String(phone_number).replace(/[']+/g, " ")
        : "",
      shipping_city: String(Number(city)),
      shipping_state: String(Number(state)),
      shipping_country: String(Number(country)),
      isPickupFromStore: !isNaN(Number(isPickupFromStore))
        ? Number(isPickupFromStore)
        : 0,
      total_cart_price: currencyFormatter(totalAmount),
      discount_amount: currencyFormatter(totalDiscount),
      tax_amount: currencyFormatter(totalTax),
    }
  );
};

/* Update cart online payment */

exports.updateCartTransactionDetails = async ({
  promocode,
  discount,
  discount_type,
  productIds,
  cart_id,
  totalShippingCost,
  totalDiscount,
  grandTotal,
  subTotal,
  paymentId,
  paymentMethod = 1,
  isPickupFromStore = 0,
  id,
  requestData = {},
  sessionID,
  isDHLShipment,
}) => {
  try {
    if (!paymentId) {
      return { status: -1, message: getMessage("transaction_id_is_missing") };
    }

    let ifTransactionIdAlreadyExists =
      await checkIfTransactionIdIsAlreadyExists(paymentId);
    if (ifTransactionIdAlreadyExists) {
      return { status: -1, message: getMessage("transaction_id_is_missing") };
    }
    let itemIds = [];
    let productDetails = [];
    productIds.forEach((product) => {
      product = product.split("-");
      let details = {
        deal_id: Number(product[0]),
        sub_product_id: Number(product[1]),
        item_quantity: Number(product[2]),
        item_id: Number(product[3]),
        price: Number(product[4]),
      };

      productDetails.push(details);
      itemIds.push(Number(product[3]));
    });

    for (let i = 0; i < productDetails.length; i++) {
      await updateCartItems(productDetails[i], cart_id);
      await updateProductQuantity(
        productDetails[i]["deal_id"],
        productDetails[i]["sub_product_id"],
        productDetails[i]["item_quantity"]
      );
    }

    let transactionId = await getTransactionId();
    let cartUpdateDetails = {
      tracking_id: paymentId,
      cart_transaction_status: 1,
      total_cart_price: Number(subTotal),
      total_cart_items: productIds.length,
      discount_type: Number(discount_type),
      delivery_price: Number(totalShippingCost),
      discount_amount: Number(totalDiscount),
      transaction_id: Number(transactionId),
      transaction_date: getCurrentTimestamp(),
      grand_total_price: Number(grandTotal),
      coupon_code: promocode,
      coupon_apply: totalDiscount > 0 ? 1 : 0,
      coupon_percentage: String(Number(discount)),
      payment_status: 1,
      isCashOnDelivery: 0,
      type: 0,
      paymentStatusCOD: 1,
      sessionID: "",
      isOrderFromSession: 0,
      isDHLShipment: isDHLShipment,
      DHLshippingCost: totalShippingCost,
      isPickupFromStore: 0,
      promocode_dump: JSON.stringify({
        code: promocode,
        type: discount_type,
        discount: discount,
      }),
    };

    if (paymentMethod === -1 || paymentMethod === -2) {
      cartUpdateDetails["isCashOnDelivery"] = 1;
      cartUpdateDetails["paymentStatusCOD"] = 0;
      cartUpdateDetails["payment_status"] = 0;
      cartUpdateDetails["type"] = 5;
    }

    if (sessionID) {
      cartUpdateDetails["isOrderFromSession"] = 1;
      cartUpdateDetails["sessionID"] = sessionID;
    }
    if (
      paymentMethod === -2 ||
      (requestData["isPickupFromStore"] &&
        !isNaN(Number(requestData["isPickupFromStore"]))) ||
      (!isNaN(isPickupFromStore) && isPickupFromStore)
    ) {
      cartUpdateDetails["isPickupFromStore"] = 1;
    }
    if (paymentMethod == 2) {
      cartUpdateDetails["payment_status"] = 2;
      cartUpdateDetails["type"] = 6;
    }
    let paymentLogDetails = {
      paymentId: id,
      status: 1,
      paymentToken: paymentId,
      method: paymentMethod,
      cartId: cart_id,
      paid_on: getCurrentTime().format("YYYY-MM-DD hh:mm:ss"),
    };

    if (Number(paymentMethod) === -1 || paymentMethod === -2) {
      await updateCartDetails(requestData);
    }

    if (sessionID) {
      await removeCartDetailsFromSession(sessionID);
    }

    await updateCart(cartUpdateDetails, cart_id);
    await deleteOtherProductsInCart(itemIds, cart_id);
    await insertPaymentLog(paymentLogDetails);

    return { status: 1, transactionId: transactionId };
  } catch (err) {
    console.log(err);
    console.log("Error in updateCartTransactionDetails:", err);
    return { status: 0 };
  }
};

exports.updateCartTransactionDetailsTabby = async ({
  promocode,
  discount,
  discount_type,
  productIds,
  cart_id,
  totalShippingCost,
  totalDiscount,
  grandTotal,
  subTotal,
  paymentId,
  paymentMethod = 7,
  isPickupFromStore = 0,
  id,
  tabby_installment_count,
  tabby_installment_period,
  tabby_payment_status,
  tamara_payment_mode,
  tamara_payment_status,
  tamara_instalments_count,
  requestData = {},
  sessionID,
  isDHLShipment,
}) => {
  try {
    if (!paymentId) {
      return { status: -1, message: getMessage("transaction_id_is_missing") };
    }

    let ifTransactionIdAlreadyExists =
      await checkIfTransactionIdIsAlreadyExists(paymentId);
    if (ifTransactionIdAlreadyExists) {
      return { status: -1, message: getMessage("transaction_id_is_missing") };
    }
    let itemIds = [];
    let productDetails = [];
    productIds.forEach((product) => {
      let details = {
        deal_id: Number(product.deal_id),
        sub_product_id: Number(product.sub_product_id),
        item_quantity: Number(product.item_quantity),
        item_id: Number(product.item_id),
        price: Number(product.currentPrice),
      };
      productDetails.push(details);
      itemIds.push(Number(product.item_id));
    });

    for (let i = 0; i < productDetails.length; i++) {
      await updateCartItems(productDetails[i], cart_id);
      await updateProductQuantity(
        productDetails[i]["deal_id"],
        productDetails[i]["sub_product_id"],
        productDetails[i]["item_quantity"]
      );
    }

    let transactionId = await getTransactionId();
    let cartUpdateDetails = {
      tracking_id: paymentId,
      cart_transaction_status: 1,
      total_cart_price: Number(subTotal),
      total_cart_items: productIds.length,
      discount_type: Number(discount_type),
      delivery_price: Number(totalShippingCost),
      discount_amount: Number(totalDiscount),
      transaction_id: Number(transactionId),
      transaction_date: getCurrentTimestamp(),
      grand_total_price: Number(grandTotal),
      coupon_code: promocode,
      coupon_apply: totalDiscount > 0 ? 1 : 0,
      coupon_percentage: String(Number(discount)),
      payment_status: 1,
      isCashOnDelivery: 0,
      type: 0,
      paymentStatusCOD: 1,
      sessionID: "",
      isOrderFromSession: 0,
      isPickupFromStore: 0,
      isDHLShipment: isDHLShipment,
      DHLshippingCost: totalShippingCost,
      promocode_dump: JSON.stringify({
        code: promocode,
        type: discount_type,
        discount: discount,
      }),
    };

    if (paymentMethod === -1 || paymentMethod === -2) {
      cartUpdateDetails["isCashOnDelivery"] = 1;
      cartUpdateDetails["paymentStatusCOD"] = 0;
      cartUpdateDetails["payment_status"] = 0;
      cartUpdateDetails["type"] = 5;
    }

    if (sessionID) {
      cartUpdateDetails["isOrderFromSession"] = 1;
      cartUpdateDetails["sessionID"] = sessionID;
    }
    if (
      paymentMethod === -2 ||
      (requestData["isPickupFromStore"] &&
        !isNaN(Number(requestData["isPickupFromStore"]))) ||
      (!isNaN(isPickupFromStore) && isPickupFromStore)
    ) {
      cartUpdateDetails["isPickupFromStore"] = 1;
    }
    if (paymentMethod == 7) {
      cartUpdateDetails["payment_status"] = 1;
      cartUpdateDetails["type"] = 7;
    }
    let paymentLogDetails = {
      paymentId: paymentId,
      status: 1,
      paymentToken: "",
      method: paymentMethod,
      cartId: cart_id,
      paid_on: getCurrentTime().format("YYYY-MM-DD hh:mm:ss"),
      tabby_installment_count: tabby_installment_count,
      tabby_installment_period: tabby_installment_period,
      tabby_payment_status: tabby_payment_status,
      tamara_payment_mode: tamara_payment_mode,
      tamara_payment_status: tamara_payment_status,
      tamara_instalments_count: tamara_instalments_count,
    };

    if (Number(paymentMethod) === -1 || paymentMethod === -2) {
      await updateCartDetails(requestData);
    }
    if (sessionID) {
      await removeCartDetailsFromSession(sessionID);
    }

    await updateCartForTabby(cartUpdateDetails, cart_id);
    await deleteOtherProductsInCart(itemIds, cart_id);

    await insertPaymentLogForTabby(paymentLogDetails);

    return { status: 1, transactionId: transactionId };
  } catch (err) {
    console.log(err);
    console.log("Error in updateCartTransactionDetails:", err);
    return { status: 0 };
  }
};

exports.updateTabbyCartDetails = async (requestData) => {
  await updateOne(
    "cart",
    { cart_id: Number(requestData.cart_id) },
    {
      notes: requestData.notes
        ? String(requestData.notes).replace(/[']+/g, " ")
        : "",
      delivery_type: 1,
      delivery_price: requestData.totalShippingCost,
      grand_total_price: currencyFormatter(requestData.grandTotal),
      shipping_name: requestData.name
        ? String(requestData.name).replace(/[']+/g, " ")
        : "",
      shipping_address: requestData.address
        ? String(requestData.address).replace(/[']+/g, " ")
        : "",
      shipping_phone: requestData.phone_number
        ? String(requestData.phone_number).replace(/[']+/g, " ")
        : "",
      shipping_city: String(Number(requestData.city)),
      shipping_state: String(Number(requestData.state)),
      shipping_country: String(Number(requestData.country)),
      isPickupFromStore: !isNaN(Number(requestData.isPickupFromStore))
        ? Number(requestData.isPickupFromStore)
        : 0,
      total_cart_price: currencyFormatter(requestData.subTotal),
      discount_amount: currencyFormatter(requestData.totalDiscount),
      tax_amount: currencyFormatter(requestData.totalTax),
    }
  );
};

const checkIfTransactionIdIsAlreadyExists = async (transactionId) => {
  const transactionCount = await count("cart", {
    tracking_id: String(transactionId),
  });
  return transactionCount > 0;
};

exports.fetchDimensionsFromService = async (subProductIds) => {
  const ids = (subProductIds || [])
    .map((id) => Number(id))
    .filter((id) => !isNaN(id));
  if (!ids.length) return null;

  const rows = await findAll(
    "sub_products",
    { id: { $in: ids } },
    { attributes: ["id", "weight", "height", "plength", "width"] }
  );
  return rows && rows.length > 0 ? rows[0] : null;
};

const updateCartItems = async (productDetail, cartId) => {
  const updated = await updateOne(
    "cart_items",
    {
      cart_id: Number(cartId),
      sub_product_id: Number(productDetail?.sub_product_id),
      item_id: Number(productDetail.item_id),
    },
    {
      item_quantity: Number(productDetail?.item_quantity),
      deal_value: Number(productDetail.price),
      cart_transaction_status: 1,
    }
  );
  return updated ? 1 : 0;
};

const updateProductQuantity = async (productId, subProductId, quantity) => {
  await getModel("sub_products").updateOne(
    { id: Number(subProductId) },
    { $inc: { quantity: -Number(quantity) } }
  );
  await getModel("product").updateOne(
    { deal_id: Number(productId) },
    { $inc: { user_limit_quantity: -Number(quantity) } }
  );
};

const getTransactionId = async () => {
  const latest = await findOne(
    "cart",
    {},
    {
      attributes: ["transaction_id"],
      order: [["transaction_id", "DESC"]],
    }
  );
  return latest && latest["transaction_id"] > 0
    ? Number(latest["transaction_id"]) + 1
    : 1;
};

const updateCart = async (cartUpdateDetails, cartId) => {
  await updateOne(
    "cart",
    { cart_id: Number(cartId) },
    {
      tracking_id: cartUpdateDetails.tracking_id,
      cart_transaction_status: Number(
        cartUpdateDetails.cart_transaction_status
      ),
      total_cart_price: cartUpdateDetails.total_cart_price,
      total_cart_items: cartUpdateDetails.total_cart_items,
      delivery_price: cartUpdateDetails.delivery_price,
      discount_amount: cartUpdateDetails.discount_amount,
      transaction_id: cartUpdateDetails.transaction_id,
      transaction_date: cartUpdateDetails.transaction_date,
      grand_total_price: cartUpdateDetails.grand_total_price,
      payment_status: cartUpdateDetails.payment_status,
      type: cartUpdateDetails.type,
      isCashOnDelivery: Number(cartUpdateDetails.isCashOnDelivery),
      paymentStatusCOD: Number(cartUpdateDetails.paymentStatusCOD),
      isPickupFromStore: Number(cartUpdateDetails.isPickupFromStore),
      isDHLShipment: Number(cartUpdateDetails.isDHLShipment),
      DHLshippingCost: Number(cartUpdateDetails.DHLshippingCost),
      sessionID: cartUpdateDetails.sessionID,
      isOrderFromSession: Number(cartUpdateDetails.isOrderFromSession),
      promocode_dump: cartUpdateDetails.promocode_dump,
      coupon_code: cartUpdateDetails.coupon_code,
      coupon_apply: cartUpdateDetails.coupon_apply,
      coupon_percentage: String(cartUpdateDetails.coupon_percentage ?? "0"),
      discount_type: cartUpdateDetails.discount_type,
    }
  );
};

const updateCartForTabby = async (cartUpdateDetails, cart_id) => {
  await updateOne(
    "cart",
    { cart_id: Number(cart_id) },
    {
      tracking_id: cartUpdateDetails.tracking_id,
      cart_transaction_status: Number(
        cartUpdateDetails.cart_transaction_status
      ),
      total_cart_price: cartUpdateDetails.total_cart_price,
      total_cart_items: cartUpdateDetails.total_cart_items,
      delivery_price: cartUpdateDetails.delivery_price,
      discount_amount: cartUpdateDetails.discount_amount,
      transaction_id: cartUpdateDetails.transaction_id,
      transaction_date: cartUpdateDetails.transaction_date,
      grand_total_price: cartUpdateDetails.grand_total_price,
      payment_status: cartUpdateDetails.payment_status,
      type: cartUpdateDetails.type,
      isCashOnDelivery: Number(cartUpdateDetails.isCashOnDelivery),
      paymentStatusCOD: Number(cartUpdateDetails.paymentStatusCOD),
      isPickupFromStore: Number(cartUpdateDetails.isPickupFromStore),
      sessionID: cartUpdateDetails.sessionID,
      isDHLShipment: Number(cartUpdateDetails.isDHLShipment),
      DHLshippingCost: Number(cartUpdateDetails.DHLshippingCost),
      isOrderFromSession: Number(cartUpdateDetails.isOrderFromSession),
      promocode_dump: cartUpdateDetails.promocode_dump,
      coupon_code: cartUpdateDetails.coupon_code,
      coupon_apply: cartUpdateDetails.coupon_apply,
      coupon_percentage: String(cartUpdateDetails.coupon_percentage ?? "0"),
      discount_type: cartUpdateDetails.discount_type,
    }
  );
};

const deleteOtherProductsInCart = async (itemIds, cartId) => {
  const ids = (itemIds || []).map((id) => Number(id)).filter((id) => !isNaN(id));
  const filter = { cart_id: Number(cartId) };
  if (ids.length) {
    filter.item_id = { $nin: ids };
  }
  await deleteMany("cart_items", filter);
};

const insertPaymentLog = async (paymentLogDetails) => {
  await create("hesabe_payment_log", {
    status: Number(paymentLogDetails.status),
    payment_token: paymentLogDetails.paymentToken ?? "",
    payment_id: String(paymentLogDetails.paymentId ?? ""),
    paid_on: paymentLogDetails.paid_on,
    method: Number(paymentLogDetails.method),
    cart_id: Number(paymentLogDetails.cartId),
    tabby_installment_count: 0,
    tabby_installment_period: "",
    tabby_payment_status: "",
    tamara_payment_mode: "",
    tamara_payment_status: "",
    tamara_instalments_count: 0,
  });
};

const insertPaymentLogForTabby = async (paymentLogDetails) => {
  await create("hesabe_payment_log", {
    status: Number(paymentLogDetails.status),
    payment_token: paymentLogDetails.paymentToken ?? "",
    payment_id: String(paymentLogDetails.paymentId ?? ""),
    paid_on: paymentLogDetails.paid_on,
    method: Number(paymentLogDetails.method),
    cart_id: Number(paymentLogDetails.cartId),
    tabby_installment_count: Number(
      paymentLogDetails.tabby_installment_count || 0
    ),
    tabby_installment_period: String(
      paymentLogDetails.tabby_installment_period || ""
    ),
    tabby_payment_status: String(
      paymentLogDetails.tabby_payment_status || ""
    ),
    tamara_payment_mode: String(paymentLogDetails.tamara_payment_mode || ""),
    tamara_payment_status: String(
      paymentLogDetails.tamara_payment_status || ""
    ),
    tamara_instalments_count: Number(
      paymentLogDetails.tamara_instalments_count || 0
    ),
  });
};

exports.updateTabbyInstallmentDetails = async (
  installments_count,
  installment_period,
  status,
  paymentId
) => {
  await updateOne(
    "hesabe_payment_log",
    { payment_id: String(paymentId) },
    {
      tabby_installment_count: installments_count,
      tabby_installment_period: installment_period,
      tabby_payment_status: status,
    }
  );
};

exports.updateTamaraInstallmentDetails = async (
  installments_count,
  installment_period,
  status,
  paymentId
) => {
  await updateOne(
    "hesabe_payment_log",
    { payment_id: String(paymentId) },
    {
      tamara_instalments_count: installments_count,
      tamara_payment_mode: installment_period,
      tamara_payment_status: status,
    }
  );
};

const removeCartDetailsFromSession = async (sessionID) => {
  try {
    let serializeCartDetails = serializeData([]);
    await updateOne(
      "sessions",
      { session_id: sessionID, isMovedToUsers: 0 },
      { cart: serializeCartDetails }
    );
    return { status: 1 };
  } catch (err) {
    console.log(err);
    return { status: 0 };
  }
};

exports.getCartAndCartProductDetails = async (userId) => {
  const carts = await findAll(
    "cart",
    { user_id: Number(userId), cart_transaction_status: 0 },
    { attributes: ["cart_id"] }
  );
  if (!carts.length) return [];

  const cartIds = carts.map((c) => c.cart_id);
  const items = await findAll(
    "cart_items",
    { cart_id: { $in: cartIds } },
    { attributes: ["cart_id", "deal_id", "item_id", "sub_product_id"] }
  );

  return items.map((item) => ({
    cart_id: item.cart_id,
    deal_id: item.deal_id,
    item_id: item.item_id,
    sub_product_id: item.sub_product_id,
  }));
};

exports.removeExistingCartDetails = async (cartId, sessionID, userInfo) => {
  try {
    let cartDetails = null;
    let wishlist = null;
    if (sessionID && sessionID !== "") {
      let sessionWishlistAndCart = await getUserSessionDetails(sessionID);

      if (
        sessionWishlistAndCart &&
        sessionWishlistAndCart.length > 0 &&
        !sessionWishlistAndCart[0]["isMovedToUsers"]
      ) {
        if (cartId && cartId !== "" && !isNaN(cartId)) {
          await deleteMany("cart_items", { cart_id: Number(cartId) });
        }

        wishlist = sessionWishlistAndCart[0]["wishlist"];
        if (
          sessionWishlistAndCart[0]["cart"] &&
          sessionWishlistAndCart[0]["cart"] !== ""
        ) {
          let deserializedCartDetails = deserializeData(
            sessionWishlistAndCart[0]["cart"]
          );
          if (Array.isArray(deserializedCartDetails)) {
            cartDetails = deserializedCartDetails;
          }
        }
        if (cartDetails && cartDetails?.length > 0) {
          for (let i = 0; i < cartDetails.length; i++) {
            await addToCart(cartDetails[i], userInfo, true);
          }
        }

        if (wishlist && wishlist !== "") {
          await updateOne(
            "users",
            { user_id: Number(userInfo.user_id) },
            { wishlist: wishlist }
          );
        }

        return { status: 1, message: "" };
      } else {
        return { status: 2, message: "" };
      }
    }
  } catch (err) {
    console.log(err);
    return { status: 0, message: "" };
  }
};
