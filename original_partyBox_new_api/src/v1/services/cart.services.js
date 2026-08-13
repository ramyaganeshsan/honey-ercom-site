const {
  getMessage,
  currencyFormatter,
  getCurrentTimestamp,
  calculateProductDiscountAndSavings,
  serializeData,
} = require("../utils");
const { PRODUCT_THUMP_DISPLAY_IMAGE } = require("../utils/constants");
const {
  findOne,
  findAll,
  create,
  updateOne,
  deleteOne,
  deleteMany,
  getModel,
} = require("../mongo/repo");

const byIdMap = (rows, key) => {
  const map = {};
  for (const row of rows || []) {
    map[row[key]] = row;
  }
  return map;
};

exports.getMyCartProducts = async (userId) => {
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

  const [subProducts, products] = await Promise.all([
    subProductIds.length
      ? findAll("sub_products", { id: { $in: subProductIds } })
      : Promise.resolve([]),
    dealIds.length
      ? findAll("product", {
          deal_id: { $in: dealIds },
          deal_status: 1,
        })
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

  const seen = new Set();
  const response = [];
  for (const item of items) {
    if (seen.has(item.item_id)) continue;
    seen.add(item.item_id);
    const sub = subMap[item.sub_product_id] || {};
    const product = productMap[item.deal_id] || {};
    const size = sizeMap[sub.size_id] || {};
    response.push({
      deal_id: item.deal_id,
      deal_key: item.deal_key,
      cart_id: item.cart_id,
      item_id: item.item_id,
      deal_value: item.deal_value,
      item_quantity: item.item_quantity,
      sub_product_id: item.sub_product_id,
      currentPrice: sub.discount,
      size_id: sub.size_id,
      sku: sub.sku,
      size_name: size.size_name,
      deal_title: product.deal_title,
      deal_title_french: product.deal_title_french,
      inStock: Number(sub.quantity) > 0,
      image: `${PRODUCT_THUMP_DISPLAY_IMAGE}${item.deal_key}_1.png`,
    });
  }
  return response;
};

/* UPDATE CART DETAILS */
exports.updateCart = async ({ products, userDetails }) => {
  try {
    let subProductIds = [];
    let productMap = {};
    let subProductMap = {};
    let validProducts = [];
    let validProductIds = [];

    let totalCartPrice = 0;
    let totalCartProducts = 0;
    let deliveryPrice = 0;
    let grandCartTotal = 0;

    products?.forEach((product) => {
      subProductIds.push(Number(product.sub_product_id));
      productMap[product?.sub_product_id] = product;
    });

    let userCartDetails = await getUserCartDetails(userDetails);
    if (!userCartDetails || userCartDetails.length === 0) {
      throw new Error(getMessage("cart_not_found"));
    }

    let cartId = userCartDetails[0]["cart_id"];

    if (!cartId) {
      throw new Error(getMessage("cart_not_found"));
    }

    let productDetails = await getSubProductDetails(subProductIds);

    for (let i = 0; i < productDetails?.length; i++) {
      let productDetail = productDetails[i];
      subProductMap[productDetail?.id] = productDetail;
    }

    for (let i = 0; i < productDetails.length; i++) {
      let productDetail = productDetails[i];
      let dealId = productDetail["id"];

      if (productMap[dealId] && subProductMap[dealId]) {
        if (
          Number(subProductMap[dealId]["sub_product_quantity"]) <
          Number(productMap[dealId]["item_quantity"])
        ) {
          return {
            status: -1,
            message: getMessage("product_quantity_is_not_enough").replace(
              "##PRODUCT_NAME##",
              subProductMap[dealId]["deal_title"]
            ),
          };
        }

        if (subProductMap[dealId]["sub_product_quantity"] >= 0) {
          totalCartPrice +=
            productMap[dealId]["item_quantity"] *
            subProductMap[dealId]["sub_product_value"];
          let { savings, discount } = calculateProductDiscountAndSavings(
            subProductMap[dealId]["sub_product_price"],
            subProductMap[dealId]["sub_product_value"]
          );

          validProductIds.push(productMap[dealId]["sub_product_id"]);
          validProducts.push({
            item_id: productMap[dealId]["item_id"],
            item_quantity: productMap[dealId]["item_quantity"],
            deal_value: currencyFormatter(
              subProductMap[dealId]["sub_product_value"]
            ),
            deal_price: currencyFormatter(
              subProductMap[dealId]["sub_product_price"]
            ),
            deal_savings: currencyFormatter(savings),
            deal_percentage: currencyFormatter(discount),
          });
        }
      }
    }

    for (let i = 0; i < validProducts?.length; i++) {
      let cartItem = validProducts[i];
      let response = await updateCartItems(cartItem.item_id, cartItem);
      if (response === -1) {
        throw new Error(getMessage("something_went_wrong_error"));
      }
    }

    grandCartTotal = totalCartPrice;
    totalCartProducts = validProducts.length;
    let cartResponse = await updateUserCartDetails(
      cartId,
      totalCartProducts,
      totalCartPrice,
      deliveryPrice,
      grandCartTotal
    );
    if (cartResponse === -1) {
      throw new Error(getMessage("something_went_wrong_error"));
    }
    await deleteRemovedProducts(cartId, validProductIds);

    return { status: 1, totalCartProducts: totalCartProducts };
  } catch (err) {
    console.log(err);
    return { status: 0, totalCartProducts: 0 };
  }
};

const getUserCartDetails = async (userDetails) => {
  const cart = await findOne(
    "cart",
    {
      user_id: Number(userDetails?.user_id),
      cart_transaction_status: 0,
    },
    { attributes: ["cart_id", "total_cart_items"] }
  );
  return cart ? [cart] : [];
};

const getSubProductDetails = async (subProductIds) => {
  const ids = (Array.isArray(subProductIds) ? subProductIds : [subProductIds])
    .map((id) => Number(id))
    .filter((id) => !isNaN(id));
  if (!ids.length) return [];

  const subProducts = await findAll("sub_products", { id: { $in: ids } });
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
  const productMap = byIdMap(products, "deal_id");

  return subProducts.map((sp) => ({
    product_id: sp.product_id,
    id: sp.id,
    deal_title: productMap[sp.product_id]?.deal_title,
    deal_title_french: productMap[sp.product_id]?.deal_title_french,
    sub_product_value: sp.discount,
    sub_product_price: sp.price,
    sub_product_quantity: sp.quantity,
  }));
};

const deleteRemovedProducts = async (cartId, validProductIds) => {
  const ids = (validProductIds || [])
    .map((id) => Number(id))
    .filter((id) => !isNaN(id));
  const filter = { cart_id: Number(cartId) };
  if (ids.length) {
    filter.sub_product_id = { $nin: ids };
  }
  return deleteMany("cart_items", filter);
};

const updateCartItems = async (itemId, productDetails) => {
  try {
    const updated = await updateOne(
      "cart_items",
      { item_id: Number(itemId) },
      {
        item_quantity: Number(productDetails.item_quantity),
        deal_value: Number(productDetails.deal_value),
        deal_price: Number(productDetails.deal_price),
        deal_savings: Number(productDetails.deal_savings),
        deal_percentage: Number(productDetails.deal_percentage),
      }
    );
    return updated ? 1 : 0;
  } catch (err) {
    console.log(err?.message);
    return -1;
  }
};

const updateUserCartDetails = async (
  cartId,
  totalCartItems,
  totalCartPrice,
  deliveryPrice,
  grandTotalPrice
) => {
  try {
    const updated = await updateOne(
      "cart",
      { cart_id: Number(cartId) },
      {
        total_cart_items: Number(totalCartItems),
        total_cart_price: Number(totalCartPrice),
        delivery_price: Number(deliveryPrice),
        grand_total_price: Number(grandTotalPrice),
      }
    );
    return updated ? 1 : 0;
  } catch (err) {
    console.log(err?.message);
    return -1;
  }
};

/* END OF UPDATE CART DETAILS FUNCTION */

exports.addToCart = async (
  cartProductDetails,
  userDetails,
  fromSession = false
) => {
  try {
    let { dealId, quantity, sizeId } = cartProductDetails;

    if (isNaN(quantity) || quantity <= 0) {
      return { status: -1, message: "Invalid quantity" };
    }

    let totalPrice = 0;
    let totalCartProducts = 0;
    let subProductId = "";

    const product = await findOne(
      "product",
      { deal_id: Number(dealId), deal_status: 1 },
      {
        attributes: [
          "deal_title",
          "deal_title_french",
          "url_title",
          "deal_key",
          "deal_description",
          "deal_description_french",
          "deal_price",
          "deal_savings",
          "deal_percentage",
          "deal_value",
          "having_size_color",
          "user_limit_quantity",
          "deal_status",
        ],
      }
    );
    let productDetails = product ? [product] : [];

    if ((!productDetails || productDetails?.length <= 0) && !sizeId) {
      return { status: -1, message: getMessage("product_not_found") };
    }

    if (
      (productDetails?.length > 0 &&
        productDetails[0]["user_limit_quantity"] <= 0 &&
        !fromSession) ||
      (productDetails?.length > 0 &&
        productDetails[0]["user_limit_quantity"] > 0 &&
        productDetails[0]["user_limit_quantity"] < quantity &&
        !sizeId &&
        !fromSession)
    ) {
      return {
        status: -1,
        message: getMessage("product_quantity_is_not_enough").replace(
          "##PRODUCT_NAME##",
          productDetails[0]["deal_title"]
        ),
      };
    }

    if (productDetails[0] && productDetails[0]["deal_value"] && !sizeId) {
      totalPrice = currencyFormatter(
        quantity * productDetails[0]["deal_value"]
      );
      if (isNaN(totalPrice)) totalPrice = 0;
    }

    let userCartDetails = await getUserCartDetails(userDetails);
    let cartId = "";
    if (
      userCartDetails &&
      userCartDetails.length > 0 &&
      userCartDetails[0]["cart_id"]
    ) {
      cartId = userCartDetails[0]["cart_id"];
    }

    const subFilter = { product_id: Number(dealId) };
    if (sizeId !== "" && !isNaN(sizeId)) {
      subFilter.size_id = Number(sizeId);
    }
    const subProducts = await findAll(
      "sub_products",
      subFilter,
      {
        attributes: [
          "id",
          "product_id",
          "quantity",
          "price",
          "discount",
          "sku",
        ],
      }
    );
    let subProductDetails = subProducts || [];

    if (!subProductDetails || subProductDetails?.length <= 0) {
      return { status: -1, message: getMessage("product_not_found") };
    }

    if (sizeId !== "" && !isNaN(sizeId)) {
      if (!subProductDetails || subProductDetails?.length <= 0) {
        return { status: -1, message: getMessage("product_not_found") };
      }

      if (
        (subProductDetails?.length > 0 &&
          subProductDetails[0]["quantity"] <= 0) ||
        (subProductDetails?.length > 0 &&
          subProductDetails[0]["quantity"] > 0 &&
          subProductDetails[0]["quantity"] < quantity)
      ) {
        return {
          status: -1,
          message: getMessage("product_quantity_is_not_enough").replace(
            "##PRODUCT_NAME##",
            productDetails[0]["deal_title"]
          ),
        };
      }

      subProductId = subProductDetails[0]["id"];

      if (subProductDetails[0]["discount"]) {
        totalPrice = currencyFormatter(
          quantity * subProductDetails[0]["discount"]
        );
        if (isNaN(totalPrice)) totalPrice = 0;
      }
    }
    if (!cartId) {
      totalCartProducts = 1;

      let insertedId = await insertCartDetails(userDetails, totalPrice);

      await insertProductIntoCartItems(
        insertedId,
        dealId,
        quantity,
        userDetails,
        productDetails,
        subProductDetails
      );
    } else {
      const cartItemFilter = {
        cart_id: Number(cartId),
        deal_id: Number(dealId),
      };
      if (subProductId !== "" && !isNaN(subProductId)) {
        cartItemFilter.sub_product_id = Number(subProductId);
      }
      let cartItemDetails = await findAll(
        "cart_items",
        cartItemFilter,
        { attributes: ["item_quantity"] }
      );

      if (cartItemDetails && cartItemDetails.length > 0) {
        let newQuantity = cartItemDetails[0]["item_quantity"] + quantity;
        await updateOne("cart_items", cartItemFilter, {
          item_quantity: newQuantity,
        });

        await getModel("cart").updateOne(
          { cart_id: Number(cartId), cart_transaction_status: 0 },
          {
            $inc: {
              total_cart_price: Number(totalPrice),
              grand_total_price: Number(totalPrice),
            },
          }
        );

        totalCartProducts += Number(userCartDetails[0]["total_cart_items"]);
      } else {
        await insertProductIntoCartItems(
          cartId,
          dealId,
          quantity,
          userDetails,
          productDetails,
          subProductDetails
        );

        await getModel("cart").updateOne(
          { cart_id: Number(cartId), cart_transaction_status: 0 },
          {
            $inc: {
              total_cart_items: 1,
              total_cart_price: Number(totalPrice),
              grand_total_price: Number(totalPrice),
            },
          }
        );

        totalCartProducts += Number(userCartDetails[0]["total_cart_items"]) + 1;
      }
    }

    return { status: 1, totalCartProducts: totalCartProducts };
  } catch (err) {
    console.log(err);
    return { status: 0, totalCartProducts: 0 };
  }
};

const insertProductIntoCartItems = async (
  cartId,
  dealId,
  quantity,
  userDetails,
  productDetails,
  subProductDetails
) => {
  console.log("subProductDetails : ", subProductDetails);
  console.log("productDetails : ", productDetails);

  const created = await create("cart_items", {
    cart_id: Number(cartId),
    cart_userid: Number(userDetails?.user_id),
    is_item_customized: 0,
    item_color: "0",
    item_color_code: "0",
    item_size: "0",
    color_name: "",
    size_name: "",
    item_quantity: Number(quantity),
    item_custom_details: "",
    item_custom_image: "",
    deal_id: Number(dealId),
    sub_product_id: Number(subProductDetails[0]["id"]),
    deal_title: String(productDetails[0]["deal_title"] || "").replace(
      /[']+/g,
      " "
    ),
    deal_title_french: String(
      productDetails[0]["deal_title_french"] || ""
    ).replace(/[']+/g, " "),
    url_title: String(productDetails[0]["url_title"] || "").replace(
      /[']+/g,
      " "
    ),
    deal_key: String(productDetails[0]["deal_key"] || "").replace(
      /[']+/g,
      " "
    ),
    deal_description: String(
      productDetails[0]["deal_description"] || ""
    ).replace(/[']+/g, " "),
    deal_description_french: String(
      productDetails[0]["deal_description_french"] || ""
    ).replace(/[']+/g, " "),
    shop_id: 1,
    deal_value: Number(
      subProductDetails[0]["discount"] ||
        productDetails[0]["deal_value"] ||
        subProductDetails[0]["price"] ||
        0
    ),
    deal_price: Number(
      subProductDetails[0]["price"] || productDetails[0]["deal_price"] || 0
    ),
    deal_savings: Number(productDetails[0]["deal_savings"] || 0),
    deal_percentage: Number(productDetails[0]["deal_percentage"] || 0),
    deal_status: Number(productDetails[0]["deal_status"] || 1),
    created_date: new Date(),
    error_message: "",
    errors: 0,
    cart_transaction_status: 0,
    admin_status: 0,
    delivery_status: 0,
    shipping_date: 0,
    sku: String(subProductDetails[0]["sku"] || "").replace(/[']+/g, " "),
    quantity_update_status: 0,
    filling_option: 0,
    filling_price: 0,
  });

  if (!created?.item_id && created?.item_id !== 0) {
    throw new Error(getMessage("something_went_wrong_error"));
  }

  return created.item_id;
};

const insertCartDetails = async (userDetails, totalPrice) => {
  const created = await create("cart", {
    tax_amount: 0,
    user_id: Number(userDetails?.user_id),
    total_cart_items: 1,
    total_cart_price: Number(totalPrice) || 0,
    cancel_amount: 0,
    is_cancel: 0,
    delivery_type: 1,
    delivery_price: 0,
    delivery_period: "0",
    delivery_terms: "",
    delivery_terms_arabic: "",
    grand_total_price: Number(totalPrice) || 0,
    created_on: getCurrentTimestamp(),
    cart_transaction_status: 0,
    transaction_id: 0,
    tracking_id: "",
    shipping_name: "",
    shipping_address: "",
    shipping_address1: "",
    shipping_phone: "",
    shipping_city: "",
    shipping_state: "",
    shipping_country: "",
    shipping_zip: "",
    shipping_date: 0,
    transaction_date: 0,
    shipping_time: 0,
    billing_info: "",
    order_date: 0,
    shipping_log: "",
    type: 0,
    gateway_opened: false,
    gateway_opened_time: 0,
    coupon_code: "",
    coupon_apply: 0,
    wallet_apply: 0,
    wallet_amount: 0,
    coupon_percentage: "0",
    payment_status: 0,
    notes: "",
    discount_amount: 0,
    isPaymentFromTabby: 0,
    promocode_dump: null,
  });

  if (!created?.cart_id && created?.cart_id !== 0) {
    throw new Error(getMessage("something_went_wrong_error"));
  }

  return created.cart_id;
};
/* END OF ADD TO CART FUNCTION */

exports.removeAllCartProducts = async (userDetails) => {
  try {
    let userCartDetails = await getUserCartDetails(userDetails);

    if (!userCartDetails || userCartDetails.length === 0) {
      return { status: 1, message: getMessage("empty_cart_message") };
    }

    let cartId = userCartDetails[0]["cart_id"];

    if (!cartId) {
      throw new Error(getMessage("cart_not_found"));
    }

    await deleteOne("cart", { cart_id: Number(cartId) });
    await deleteMany("cart_items", { cart_id: Number(cartId) });

    return { status: 1 };
  } catch (err) {
    console.log(err);
    return { status: 0, message: err?.message };
  }
};

exports.updateCartSession = async (sessionID, cartDetails) => {
  try {
    await updateOne(
      "sessions",
      { session_id: sessionID },
      { cart: cartDetails }
    );
    return 1;
  } catch (err) {
    console.log(err);
    return 0;
  }
};

exports.getCartDetailsUsingSessionDetails = async (cartDetails) => {
  if (cartDetails && cartDetails.length > 0) {
    const productIds = cartDetails.map((cartDetail) => Number(cartDetail.dealId));
    const products = await findAll("product", {
      deal_id: { $in: productIds },
    });

    const orFilters = cartDetails.map((cartDetail) => ({
      product_id: Number(cartDetail.dealId),
      size_id: cartDetail["sizeId"] ? Number(cartDetail["sizeId"]) : 0,
    }));
    const subProducts = orFilters.length
      ? await findAll("sub_products", { $or: orFilters })
      : [];

    const sizeIds = [
      ...new Set(
        subProducts.map((s) => Number(s.size_id)).filter((id) => !isNaN(id) && id)
      ),
    ];
    const sizes = sizeIds.length
      ? await findAll("size", { size_id: { $in: sizeIds } })
      : [];
    const sizeMap = byIdMap(sizes, "size_id");

    const subByProductSize = {};
    for (const sp of subProducts) {
      subByProductSize[`${sp.product_id}_${sp.size_id || 0}`] = sp;
    }

    return products.map((product) => {
      // Prefer matching a session cart entry for this product
      const match =
        cartDetails.find((c) => Number(c.dealId) === Number(product.deal_id)) ||
        {};
      const sizeId = match["sizeId"] ? Number(match["sizeId"]) : 0;
      const sub =
        subByProductSize[`${product.deal_id}_${sizeId}`] ||
        subProducts.find((s) => Number(s.product_id) === Number(product.deal_id)) ||
        {};
      const size = sizeMap[sub.size_id] || {};
      return {
        deal_id: product.deal_id,
        deal_key: product.deal_key,
        deal_value: product.deal_value,
        deal_title: product.deal_title,
        deal_title_french: product.deal_title_french,
        sub_product_id: sub.id,
        currentPrice: sub.discount,
        size_id: sub.size_id,
        size_name: size.size_name,
        sku: sub.sku,
        inStock: Number(sub.quantity) > 0,
        image: `${PRODUCT_THUMP_DISPLAY_IMAGE}${product.deal_key}_1.png`,
      };
    });
  }
  return [];
};

exports.removeCartDetailsFromSession = async (sessionID) => {
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

exports.getSessionCartProductDetails = async (subProductId) => {
  let response = await getSubProductDetails(subProductId);
  return response;
};

exports.getProductDetailSession = async (dealId, sizeId) => {
  const filter = { product_id: Number(dealId) };
  if (sizeId && !isNaN(sizeId)) {
    filter.size_id = Number(sizeId);
  }
  const subProducts = await findAll("sub_products", filter, {
    attributes: ["quantity", "product_id"],
  });
  if (!subProducts.length) return [];

  const product = await findOne(
    "product",
    { deal_id: Number(dealId), deal_status: 1 },
    { attributes: ["deal_id", "deal_title"] }
  );
  if (!product) return [];

  return subProducts.map((sp) => ({
    quantity: sp.quantity,
    deal_title: product.deal_title,
  }));
};
