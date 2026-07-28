const tableConfig = require("../database/table.config.json");
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

exports.getUserCheckoutDetails = async (userId) => {
  let query = `
    SELECT 
        ${tableConfig.cart_items}.deal_id,
        ${tableConfig.cart_items}.deal_key,
        ${tableConfig.cart_items}.cart_id,
        ${tableConfig.cart_items}.item_id,
        ${tableConfig.cart_items}.item_quantity,
        ${tableConfig.cart_items}.sub_product_id,
        ${tableConfig.sub_products}.discount as currentPrice,
        products.deal_title,
        products.deal_title_french,
        CASE WHEN ${tableConfig.sub_products}.quantity > 0 THEN true ELSE false END AS inStock,
        CONCAT("${PRODUCT_THUMP_DISPLAY_IMAGE}", ${tableConfig.cart_items}.deal_key, "_1.png") as image,
        ${tableConfig.users}.joined_date  -- Include joined_date from users table
    FROM ${tableConfig.cart}
    LEFT JOIN ${tableConfig.cart_items} ON ${tableConfig.cart_items}.cart_id = ${tableConfig.cart}.cart_id
    LEFT JOIN ${tableConfig.sub_products} ON ${tableConfig.sub_products}.id = ${tableConfig.cart_items}.sub_product_id 
    LEFT JOIN ( SELECT deal_id, deal_title, deal_title_french FROM ${tableConfig.product} WHERE deal_status = 1 ) AS products ON products.deal_id = ${tableConfig.cart_items}.deal_id
    LEFT JOIN ${tableConfig.users} ON ${tableConfig.users}.user_id = ${tableConfig.cart}.user_id  -- Join with users table

    WHERE ${tableConfig.cart}.user_id = ${userId} AND ${tableConfig.cart}.cart_transaction_status != 1
    GROUP BY ${tableConfig.cart_items}.item_id 
    ORDER BY ${tableConfig.cart_items}.item_id DESC;`;

  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });

  return response;
};

exports.getUserAddDetails = async (userId) => {
  let query = `SELECT address1, city_id, state_id, country_id, phone_number, email, firstname, lastname FROM ${tableConfig.users} WHERE user_id = ${userId} AND user_status = 1`;
  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return response;
};

exports.getAdminEmail = async () => {
  let query = `SELECT adminEmailAddress FROM ${tableConfig.settings}`;
  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return response[0];
};

exports.getCartProducts = async (cartId, userId) => {
  let query = `
  SELECT 
    ${tableConfig.cart_items}.cart_transaction_status, 
    ${tableConfig.sub_products}.quantity,
    ${tableConfig.sub_products}.price,
    ${tableConfig.sub_products}.discount,
    ${tableConfig.cart_items}.deal_id,
    ${tableConfig.cart}.total_cart_items,
    ${tableConfig.cart}.total_cart_price,
    ${tableConfig.cart_items}.item_quantity,
    ${tableConfig.product}.deal_status,
    ${tableConfig.product}.deal_title,
    ${tableConfig.product}.deal_title_french,
    ${tableConfig.cart_items}.sub_product_id
  FROM ${tableConfig.cart}
  JOIN ${tableConfig.cart_items} ON ${tableConfig.cart_items}.cart_id = ${tableConfig.cart}.cart_id
  JOIN ${tableConfig.sub_products} ON ${tableConfig.sub_products}.id = ${tableConfig.cart_items}.sub_product_id
  JOIN ${tableConfig.product} ON ${tableConfig.product}.deal_id = ${tableConfig.cart_items}.deal_id
  WHERE ${tableConfig.cart}.cart_id = ${cartId} AND ${tableConfig.cart}.user_id = ${userId} AND ${tableConfig.cart}.cart_transaction_status != 1;`;

  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return response;
};

exports.getCityShippingCost = async (cityId) => {
  let query = `
    SELECT 
      delivery_charge
    FROM ${tableConfig.city}
    WHERE city_id = ${cityId};`;

  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return response;
};

exports.updateCartCheckoutDetails = async (requestData) => {
  await updateCartDetails(requestData);
};

const updateCartDetails = async (
  {
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
  },
  transaction = null
) => {
  let query = `
    UPDATE ${tableConfig.cart}
    SET
      notes = '${notes ? notes?.replace(/[']+/g, " ") : ""}',
      delivery_type = 1,
      delivery_price = ${shippingCost},
      grand_total_price = ${
        currencyFormatter(finalTotal) + currencyFormatter(totalAmount)
      },
      shipping_name = '${name?.replace(/[']+/g, " ") ?? ""}',
      shipping_address = '${address?.replace(/[']+/g, " ") ?? ""}',
      shipping_phone = '${phone_number?.replace(/[']+/g, " ") ?? ""}',
      shipping_city = ${Number(city)},
      shipping_state = ${Number(state)},
      shipping_country = ${Number(country)},
      isPickupFromStore = ${
        !isNaN(Number(isPickupFromStore)) ? Number(isPickupFromStore) : 0
      },
      total_cart_price=${currencyFormatter(totalAmount)},
      discount_amount=${currencyFormatter(totalDiscount)},
      tax_amount=${currencyFormatter(totalTax)}
    WHERE 
      cart_id = ${cartId};`;

  let updateConfig = {
    type: global?.SEQUELIZE?.QueryTypes?.UPDATE,
  };

  if (transaction) {
    updateConfig["transaction"] = transaction;
  }

  await global?.SEQUELIZE?.query(query, updateConfig);
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
  let transaction = await global.SEQUELIZE?.transaction();

  try {
    if (!paymentId) {
      return { status: -1, message: getMessage("transaction_id_is_missing") };
    }

    let selectConfig = {
      type: global?.SEQUELIZE?.QueryTypes?.SELECT,
      transaction: transaction,
    };
    let updateConfig = {
      type: global?.SEQUELIZE?.QueryTypes?.UPDATE,
      transaction: transaction,
    };
    let deleteConfig = {
      transaction: transaction,
    };
    let insertConfig = {
      type: global?.SEQUELIZE?.QueryTypes?.INSERT,
      transaction: transaction,
    };

    /* Check weather the transaction ID is already exists */

    let ifTransactionIdAlreadyExists =
      await checkIfTransactionIdIsAlreadyExists(paymentId, selectConfig);
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
      await updateCartItems(productDetails[i], cart_id, updateConfig);
      await updateProductQuantity(
        productDetails[i]["deal_id"],
        productDetails[i]["sub_product_id"],
        productDetails[i]["item_quantity"],
        updateConfig
      );
    }

    let transactionId = await getTransactionId(selectConfig);
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
      coupon_percentage: Number(discount),
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
      await updateCartDetails(requestData, transaction);
    }

    if (sessionID) {
      await removeCartDetailsFromSession(sessionID, updateConfig);
    }

    await updateCart(cartUpdateDetails, cart_id, updateConfig);
    await deleteOtherProductsInCart(itemIds, cart_id, deleteConfig);
    await insertPaymentLog(paymentLogDetails, insertConfig);

    await transaction.commit();
    return { status: 1, transactionId: transactionId };
  } catch (err) {
    console.log(err);
    console.log("Error in updateCartTransactionDetails:", err);

    await transaction.rollback();
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
  let transaction = await global.SEQUELIZE?.transaction();
  try {
    if (!paymentId) {
      return { status: -1, message: getMessage("transaction_id_is_missing") };
    }

    let selectConfig = {
      type: global?.SEQUELIZE?.QueryTypes?.SELECT,
      transaction: transaction,
    };
    let updateConfig = {
      type: global?.SEQUELIZE?.QueryTypes?.UPDATE,
      transaction: transaction,
    };
    let deleteConfig = {
      transaction: transaction,
    };
    let insertConfig = {
      type: global?.SEQUELIZE?.QueryTypes?.INSERT,
      transaction: transaction,
    };

    /* Check weather the transaction ID is already exists */

    let ifTransactionIdAlreadyExists =
      await checkIfTransactionIdIsAlreadyExists(paymentId, selectConfig);
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
      await updateCartItems(productDetails[i], cart_id, updateConfig);
      await updateProductQuantity(
        productDetails[i]["deal_id"],
        productDetails[i]["sub_product_id"],
        productDetails[i]["item_quantity"],
        updateConfig
      );
    }

    let transactionId = await getTransactionId(selectConfig);
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
      coupon_percentage: Number(discount),
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
      await updateCartDetails(requestData, transaction);
    }
    if (sessionID) {
      await removeCartDetailsFromSession(sessionID, updateConfig);
    }

    await updateCartForTabby(cartUpdateDetails, cart_id, updateConfig);
    await deleteOtherProductsInCart(itemIds, cart_id, deleteConfig);

    await insertPaymentLogForTabby(paymentLogDetails, insertConfig);

    await transaction.commit();
    return { status: 1, transactionId: transactionId };
  } catch (err) {
    console.log(err);
    console.log("Error in updateCartTransactionDetails:", err);

    await transaction.rollback();
    return { status: 0 };
  }
};

exports.updateTabbyCartDetails = async (requestData) => {
  transaction = null;

  let query = `
    UPDATE ${tableConfig.cart}
    SET
      notes = '${
        requestData.notes ? requestData.notes?.replace(/[']+/g, " ") : ""
      }',
      delivery_type = 1,
      delivery_price = ${requestData.totalShippingCost},
      grand_total_price = ${currencyFormatter(requestData.grandTotal)},
      shipping_name = '${requestData.name?.replace(/[']+/g, " ") ?? ""}',
      shipping_address = '${requestData.address?.replace(/[']+/g, " ") ?? ""}',
      shipping_phone = '${
        requestData.phone_number?.replace(/[']+/g, " ") ?? ""
      }',
      shipping_city = ${Number(requestData.city)},
      shipping_state = ${Number(requestData.state)},
      shipping_country = ${Number(requestData.country)},
      isPickupFromStore = ${
        !isNaN(Number(requestData.isPickupFromStore))
          ? Number(requestData.isPickupFromStore)
          : 0
      },
      total_cart_price=${currencyFormatter(requestData.subTotal)},
      discount_amount=${currencyFormatter(requestData.totalDiscount)},
      tax_amount=${currencyFormatter(requestData.totalTax)}

    WHERE 
      cart_id = ${requestData.cart_id};`;

  let updateConfig = {
    type: global?.SEQUELIZE?.QueryTypes?.UPDATE,
  };
  if (transaction) {
    updateConfig["transaction"] = transaction;
  }

  await global?.SEQUELIZE?.query(query, updateConfig);
};

const checkIfTransactionIdIsAlreadyExists = async (
  transactionId,
  selectConfig
) => {
  let query = `
    SELECT 
      count(cart_id) as transactionCount 
    FROM ${tableConfig.cart}
    WHERE tracking_id = "${transactionId}"`;

  let response = await global?.SEQUELIZE?.query(query, selectConfig);
  return response && response.length > 0 && response[0]["transactionCount"] > 0
    ? true
    : false;
};
// exports.fetchDimensionsFromService = async (subProductId, selectConfig) => {
//   const formattedIds = subProductId.map((id) => `"${id}"`).join(", ");

//   let query = `
//     SELECT
//       weight,
//       height,
//       length,
//       width
//     FROM ${tableConfig.sub_products}
// //     WHERE id IN (${formattedIds})`;

//   let response = await global?.SEQUELIZE?.query(query, selectConfig);
//   return response && response.length > 0 ? response[0] : null;
// };

exports.fetchDimensionsFromService = async (subProductIds, selectConfig) => {
  const formattedIds = subProductIds.map((id) => `"${id}"`).join(", ");

  let query = `
    SELECT
    id,
      weight,
      height,
      plength,
      width
    FROM ${tableConfig.sub_products}
    WHERE id IN (${formattedIds})`;

  let response = await global?.SEQUELIZE?.query(query, selectConfig);
  return response && response.length > 0 ? response[0] : null;
};

const updateCartItems = async (productDetail, cartId, updateConfig) => {
  let query = `
    UPDATE ${tableConfig.cart_items}
    SET
      item_quantity=${Number(productDetail?.item_quantity)},
      deal_value=${Number(productDetail.price)},
      cart_transaction_status = 1
    WHERE cart_id = ${Number(cartId)} 
      AND 
        sub_product_id = ${Number(productDetail?.sub_product_id)} 
      AND 
        item_id = ${Number(productDetail.item_id)};`;
  let [result, modified] = await global?.SEQUELIZE?.query(query, updateConfig);
  return modified;
};

const updateProductQuantity = async (
  productId,
  subProductId,
  quantity,
  updateConfig
) => {
  /* Update sub product quantity */
  let subProductQuantityUpdateQuery = `
    UPDATE ${tableConfig.sub_products}
    SET
      quantity= quantity - ${Number(quantity)}
    WHERE id=${Number(subProductId)};`;
  await global?.SEQUELIZE?.query(subProductQuantityUpdateQuery, updateConfig);

  /* update product quantity */
  let productQuantityUpdateQuery = `
    UPDATE ${tableConfig.product}
    SET
      user_limit_quantity= user_limit_quantity - ${Number(quantity)}
    WHERE deal_id=${Number(productId)};`;
  await global?.SEQUELIZE?.query(productQuantityUpdateQuery, updateConfig);
};

const getTransactionId = async (selectConfig) => {
  let query = `SELECT transaction_id FROM ${tableConfig.cart} ORDER BY transaction_id DESC LIMIT 1;`;
  let response = await global?.SEQUELIZE?.query(query, selectConfig);
  return response && response.length > 0 && response[0]["transaction_id"] > 0
    ? Number(response[0]["transaction_id"]) + 1
    : 1;
};

const updateCart = async (cartUpdateDetails, cartId, updateConfig) => {
  let query = `
    UPDATE ${tableConfig.cart}
    SET
      tracking_id= '${cartUpdateDetails.tracking_id}',
      cart_transaction_status= ${Number(
        cartUpdateDetails.cart_transaction_status
      )},
      total_cart_price= ${cartUpdateDetails.total_cart_price},
      total_cart_items= ${cartUpdateDetails.total_cart_items},
      delivery_price= ${cartUpdateDetails.delivery_price},
      discount_amount= ${cartUpdateDetails.discount_amount},
      transaction_id= ${cartUpdateDetails.transaction_id},
      transaction_date= ${cartUpdateDetails.transaction_date},
      grand_total_price= ${cartUpdateDetails.grand_total_price},
      payment_status= ${cartUpdateDetails.payment_status},
      type= ${cartUpdateDetails.type},
      isCashOnDelivery= ${Number(cartUpdateDetails.isCashOnDelivery)},
      paymentStatusCOD= ${Number(cartUpdateDetails.paymentStatusCOD)},
      isPickupFromStore= ${Number(cartUpdateDetails.isPickupFromStore)},
      isDHLShipment= ${Number(cartUpdateDetails.isDHLShipment)},
      DHLshippingCost= ${Number(cartUpdateDetails.DHLshippingCost)},
      sessionID='${cartUpdateDetails.sessionID}',
      isOrderFromSession= ${Number(cartUpdateDetails.isOrderFromSession)},
      promocode_dump= '${cartUpdateDetails.promocode_dump}'
    WHERE cart_id = ${Number(cartId)};`;
  await global?.SEQUELIZE?.query(query, updateConfig);
};
const updateCartForTabby = async (cartUpdateDetails, cart_id, updateConfig) => {
  let query = `
    UPDATE ${tableConfig.cart}
    SET
      tracking_id= '${cartUpdateDetails.tracking_id}',
      cart_transaction_status= ${Number(
        cartUpdateDetails.cart_transaction_status
      )},
      total_cart_price= ${cartUpdateDetails.total_cart_price},
      total_cart_items= ${cartUpdateDetails.total_cart_items},
      delivery_price= ${cartUpdateDetails.delivery_price},
      discount_amount= ${cartUpdateDetails.discount_amount},
      transaction_id= ${cartUpdateDetails.transaction_id},
      transaction_date= ${cartUpdateDetails.transaction_date},
      grand_total_price= ${cartUpdateDetails.grand_total_price},
      payment_status= ${cartUpdateDetails.payment_status},
      type= ${cartUpdateDetails.type},
      isCashOnDelivery= ${Number(cartUpdateDetails.isCashOnDelivery)},
      paymentStatusCOD= ${Number(cartUpdateDetails.paymentStatusCOD)},
      isPickupFromStore= ${Number(cartUpdateDetails.isPickupFromStore)},
      sessionID='${cartUpdateDetails.sessionID}',
      isDHLShipment= ${Number(cartUpdateDetails.isDHLShipment)},
      DHLshippingCost= ${Number(cartUpdateDetails.DHLshippingCost)},
      isOrderFromSession= ${Number(cartUpdateDetails.isOrderFromSession)},
      promocode_dump= '${cartUpdateDetails.promocode_dump}'
    WHERE cart_id = ${Number(cart_id)};`;
  await global?.SEQUELIZE?.query(query, updateConfig);
};

const deleteOtherProductsInCart = async (itemIds, cartId, deleteConfig) => {
  let query = `
    DELETE FROM ${tableConfig.cart_items} 
    WHERE cart_id = ${Number(cartId)} 
      AND item_id NOT IN (${itemIds.join(",")});`;
  await global?.SEQUELIZE?.query(query, deleteConfig);
};

const insertPaymentLog = async (paymentLogDetails, insertConfig) => {
  let query = `
    INSERT INTO ${tableConfig.hesabe_payment_log}
    ( 
      status, 
      payment_token, 
      payment_id, 
      paid_on, 
      method, 
      cart_id 
    ) VALUES ( 
      ${Number(paymentLogDetails.status)}, 
      "${paymentLogDetails.paymentToken}",
      "${paymentLogDetails.paymentId}",
      '${paymentLogDetails.paid_on}',
      ${Number(paymentLogDetails.method)},
      ${Number(paymentLogDetails.cartId)}
    );`;
  await global?.SEQUELIZE?.query(query, insertConfig);
};

const insertPaymentLogForTabby = async (paymentLogDetails, insertConfig) => {
  let query = `
    INSERT INTO ${tableConfig.hesabe_payment_log}
    ( 
      status, 
      payment_token, 
      payment_id, 
      paid_on, 
      method, 
      cart_id,
      tabby_installment_count,
      tabby_installment_period,
      tabby_payment_status,
      tamara_payment_mode,
      tamara_payment_status,
      tamara_instalments_count
      
    ) VALUES ( 
      ${Number(paymentLogDetails.status)}, 
      "${paymentLogDetails.paymentToken}",
      "${paymentLogDetails.paymentId}",
      "${paymentLogDetails.paid_on}",
      ${Number(paymentLogDetails.method)},
      ${Number(paymentLogDetails.cartId)},
      ${Number(paymentLogDetails.tabby_installment_count)},
      "${paymentLogDetails.tabby_installment_period}",
      "${paymentLogDetails.tabby_payment_status}",
      "${paymentLogDetails.tamara_payment_mode}",
      "${paymentLogDetails.tamara_payment_status}",
      ${Number(paymentLogDetails.tamara_instalments_count)}
      


    )`;

  await global?.SEQUELIZE?.query(query, insertConfig);
};

exports.updateTabbyInstallmentDetails = async (
  installments_count,
  installment_period,
  status,
  paymentId
) => {
  let query = `
      UPDATE hesabe_payment_log
      SET tabby_installment_count = ${installments_count},
          tabby_installment_period = "${installment_period}",
          tabby_payment_status = "${status}"
      WHERE payment_id = "${paymentId}";
    `;

  await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.UPDATE,
  });
};
exports.updateTamaraInstallmentDetails = async (
  installments_count,
  installment_period,
  status,
  paymentId
) => {
  let query = `
      UPDATE hesabe_payment_log
      SET tamara_instalments_count = ${installments_count},
          tamara_payment_mode = "${installment_period}",
          tamara_payment_status = "${status}"
      WHERE payment_id = "${paymentId}";
    `;

  await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.UPDATE,
  });
};

exports.DHLShipmentEvent = async (
  trackingNumber,
  shipmentStatus,
  eventDescription,
  eventDate,
  eventTime
) => {
  let query = `
      UPDATE cart
      SET DHLShipmentStatus = "${shipmentStatus}",
          DHLShipmentDescription = "${eventDescription}",
          DHLShipmentStatusDate = "${eventDate}",
          DHLShipmentStatusTime = "${eventTime}"
      WHERE DHL_shipmet_trackingID = "${trackingNumber}";
    `;

  await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.UPDATE,
  });
};

const removeCartDetailsFromSession = async (sessionID, updateConfig) => {
  try {
    let serializeCartDetails = serializeData([]);
    let query = `UPDATE ${tableConfig.sessions} SET cart='${serializeCartDetails}' WHERE session_id = '${sessionID}' AND isMovedToUsers = 0`;
    let config = {
      type: global?.SEQUELIZE?.QueryTypes?.UPDATE,
    };
    if (updateConfig) {
      config = updateConfig;
    }

    await global?.SEQUELIZE?.query(query, config);
    return { status: 1 };
  } catch (err) {
    console.log(err);
    return { status: 0 };
  }
};

exports.getCartAndCartProductDetails = async (userId, selectConfig) => {
  let query = `
      SELECT 
      ${tableConfig.cart}.cart_id,
      ${tableConfig.cart_items}.deal_id,
      ${tableConfig.cart_items}.item_id,
      ${tableConfig.cart_items}.sub_product_id
    FROM cart
    JOIN ${tableConfig.cart_items} ON ${tableConfig.cart_items}.cart_id = ${tableConfig.cart}.cart_id
    WHERE ${tableConfig.cart}.user_id = ${userId} AND ${tableConfig.cart}.cart_transaction_status = 0;
  `;
  let config = { type: global?.SEQUELIZE?.QueryTypes?.SELECT };
  if (selectConfig) {
    config = selectConfig;
  }
  let response = await global?.SEQUELIZE?.query(query, config);
  return response;
};

exports.removeExistingCartDetails = async (cartId, sessionID, userInfo) => {
  let transaction = await global.SEQUELIZE.transaction();
  try {
    let cartDetails = null;
    let wishlist = null;
    if (sessionID && sessionID !== "") {
      let deleteConfig = {
        transaction: transaction,
        type: global?.SEQUELIZE?.QueryTypes?.DELETE,
      };
      let selectConfig = {
        transaction: transaction,
        type: global?.SEQUELIZE?.QueryTypes?.SELECT,
      };

      let sessionWishlistAndCart = await getUserSessionDetails(
        sessionID,
        selectConfig
      );

      if (
        sessionWishlistAndCart &&
        sessionWishlistAndCart.length > 0 &&
        !sessionWishlistAndCart[0]["isMovedToUsers"]
      ) {
        if (cartId && cartId !== "" && !isNaN(cartId)) {
          /* Remove existing cart items in cart */
          let deleteQuery = `DELETE FROM ${tableConfig.cart_items} WHERE cart_id=${cartId}`;
          await global?.SEQUELIZE?.query(deleteQuery, deleteConfig);
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
          let query = `UPDATE ${
            tableConfig.users
          } SET wishlist="${wishlist}" WHERE user_id = ${Number(
            userInfo.user_id
          )}`;
          await global?.SEQUELIZE?.query(query);
        }

        transaction.commit();
        return { status: 1, message: "" };
      } else {
        await transaction.rollback();
        return { status: 2, message: "" };
      }
    }
  } catch (err) {
    console.log(err);
    await transaction.rollback();
    return { status: 0, message: "" };
  }
};
