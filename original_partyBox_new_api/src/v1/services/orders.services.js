const tableConfig = require("../database/table.config.json");
const {
  getMessage,
  getCurrentTimestamp,
  currencyFormatter,
} = require("../utils");
const { PRODUCT_THUMP_DISPLAY_IMAGE } = require("../utils/constants");
const logger = require("../utils/logger");

exports.getCartIds = async (userId, limit = 5) => {
  let query = `
        SELECT cart_id 
        FROM ${tableConfig.cart} 
        WHERE user_id = ${Number(userId)} AND cart_transaction_status = 1 
        ORDER BY cart_id DESC 
        LIMIT ${limit}`;
  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });

  return response;
};

exports.getMyOrderDetails = async (ids) => {
  let query = `
    SELECT 
        ${tableConfig.cart}.cart_id, 
        transaction_id,
        DHL_shipmet_trackingID, 
        total_cart_price,
        transaction_date, 
        grand_total_price,
        ${tableConfig.cart_items}.item_id,
        ${tableConfig.cart}.is_cancel,
        ${tableConfig.cart}.DHL_shipmet_trackingID,
        ${tableConfig.cart_items}.sub_product_id,
        ${tableConfig.product}.deal_title,
        ${tableConfig.product}.deal_title_french,
        ${tableConfig.cart_items}.deal_value,
        ${tableConfig.cart_items}.deal_value,
        ${tableConfig.cart_items}.delivery_status,
        ${tableConfig.cart_items}.admin_status,
        ${tableConfig.cart_items}.deal_id AS dealID, 
        ${tableConfig.cart_items}.item_quantity AS quantity,  
        ${tableConfig.sub_products}.size_id  AS sizeId
      
    FROM ${tableConfig.cart} 
    JOIN ${tableConfig.cart_items} ON ${tableConfig.cart_items}.cart_id = ${tableConfig.cart}.cart_id
    JOIN ${tableConfig.sub_products} ON ${tableConfig.sub_products}.id = ${tableConfig.cart_items}.sub_product_id
    JOIN ${tableConfig.product} ON ${tableConfig.product}.deal_id = ${tableConfig.sub_products}.product_id
    WHERE cart.cart_id IN (${ids}) ORDER BY transaction_id DESC
    `;
  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return response;
};

exports.cancelMyOrder = async (
  cartId,
  orderId,
  cancellationReason,
  userDetails
) => {
  let transaction = await global.SEQUELIZE.transaction();
  try {
    let cartDetailsQuery = `
      SELECT 
        ${tableConfig.cart_items}.delivery_status,
        ${tableConfig.cart_items}.item_quantity,
        ${tableConfig.cart_items}.deal_value,
        ${tableConfig.cart_items}.deal_id,
        ${tableConfig.cart_items}.sub_product_id,
        ${tableConfig.cart}.user_id,
        ${tableConfig.cart_items}.item_id,
        ${tableConfig.cart_items}.cart_id,
        ${tableConfig.cart}.is_cancel,
        ${tableConfig.cart}.transaction_id,
        ${tableConfig.cart}.cart_transaction_status
      FROM 
        ${tableConfig.cart} 
      JOIN 
        ${tableConfig.cart_items} 
      ON ${tableConfig.cart_items}.cart_id = ${tableConfig.cart}.cart_id 
      WHERE 
      ${tableConfig.cart}.cart_id = ${Number(cartId)} 
      AND 
      ${tableConfig.cart}.transaction_id = ${Number(orderId)} 
      AND 
      ${tableConfig.cart}.cart_transaction_status = 1
      AND 
      ${tableConfig.cart}.user_id = ${Number(userDetails.user_id)};
    `;

    let selectConfig = {
      type: global?.SEQUELIZE?.QueryTypes?.SELECT,
      transaction: transaction,
    };

    let cartDetails = await global?.SEQUELIZE?.query(
      cartDetailsQuery,
      selectConfig
    );
    if (!cartDetails || cartDetails.length <= 0) {
      await transaction.rollback();
      return { status: 0, message: getMessage("order_not_found") };
    }

    let cartPromise = [];
    for (let i = 0; i < cartDetails.length; i++) {
      let cartDetail = cartDetails[i];
      if (cartDetail?.delivery_status != 6) {
        cartPromise.push(
          updateCancelStatusAndInsertCancelOrderLog(
            cartDetail,
            cancellationReason,
            transaction
          )
        );
      }
    }

    await Promise.all(cartPromise);
    await transaction.commit();
    return { status: 1 };
  } catch (err) {
    console.log(err);
    logger.error(err);
    await transaction.rollback();
    return { status: 0, message: "" };
  }
};

const updateCancelStatusAndInsertCancelOrderLog = async (
  cartDetails,
  cancellationReason,
  transaction
) => {
  let updateConfig = {
    type: global?.SEQUELIZE?.QueryTypes?.UPDATE,
    transaction: transaction,
  };
  let insertConfig = {
    type: global?.SEQUELIZE?.QueryTypes?.INSERT,
    transaction: transaction,
  };

  let insertCancelOrderQuery = `
    INSERT INTO ${tableConfig.order_cancel}
    (
      product_id,
      user_id,
      transaction_id,
      cart_id,
      cart_item_id,
      quantity,
      amount,
      reason,
      cancel_process,
      process_type,
      cancel_approved_by,
      cancel_type,
      cancel_status,
      cancelled_on,
      payment_type
    )
    VALUES 
    (
      ${cartDetails.deal_id},
      ${cartDetails.user_id},
      ${cartDetails.transaction_id},
      ${cartDetails.cart_id},
      ${cartDetails.item_id},
      ${cartDetails.item_quantity},
      ${currencyFormatter(cartDetails.item_quantity * cartDetails.deal_value)},
      '${cancellationReason?.replace(/[']+/g, " ")}',
      "2",
      "0",
      "1",
      "1",
      "1",
      ${getCurrentTimestamp()},
      "0"
    );`;

  let updateCartItemsQuery = `
    UPDATE ${tableConfig.cart_items}
    SET 
      delivery_status = 6, 
      shipping_date = ${getCurrentTimestamp()},
      admin_status = 1
    WHERE 
      item_id = ${Number(cartDetails.item_id)}
    `;

  let updateCartQuery = `
    UPDATE ${tableConfig.cart} 
    SET 
      cancel_amount = cancel_amount +  ${currencyFormatter(
        cartDetails.item_quantity * cartDetails.deal_value
      )},
      is_cancel = 1
    WHERE 
      cart_id = ${cartDetails.cart_id};`;

  await Promise.all([
    global?.SEQUELIZE?.query(updateCartItemsQuery, updateConfig),
    global?.SEQUELIZE?.query(insertCancelOrderQuery, insertConfig),
    global.SEQUELIZE?.query(updateCartQuery, updateConfig),
  ]);
};

exports.getInvoicedetails = async (orderId) => {
  let query = `
    SELECT *,
      city.city_name       AS cityName,
      city.delivery_charge AS delivery_charge,
      state.state_name     AS stateName,
      country.country_name AS countryName,
      c.transaction_id     AS transid,
      oc.reason,
      oc.cancel_approved_by,
      oc.cancel_type,
      oc.cancel_status,
      oc.cancelled_on,
      ci.delivery_status,
      c.type,
      c.coupon_code,
      c.transaction_date,
      c.shipping_name      AS NAME,
      c.shipping_address   AS saddr1,
      c.shipping_address1  AS saddr2,
      c.shipping_city      AS city_name,
      c.shipping_phone     AS phone,
      c.coupon_code        AS phone,
      ci.item_color        AS product_color,
      ci.item_size         AS product_size,
      ci.filling_option,
      ci.filling_price,
      ci.item_quantity     AS quantity,
      c.delivery_price     AS shipping,
      c.coupon_apply,
      u.email              AS email,
      ci.item_id,
      c.transaction_id     AS package_number,
      c.discount_amount,
      c.promocode_dump     AS promocode,
      pl.method,
      pl.payment_id,
      c.delivery_period,
      ci.sku
    FROM ${tableConfig.cart} AS c
      LEFT JOIN ${tableConfig.cart_items} AS ci
        ON ci.cart_id = c.cart_id
      LEFT JOIN ${tableConfig.hesabe_payment_log} AS pl
        ON pl.cart_id = c.cart_id
      LEFT JOIN sub_products AS sub_products
        ON sub_products.id = ci.sub_product_id
      LEFT JOIN size AS size_new
        ON size_new.size_id = sub_products.size_id
      LEFT JOIN city
        ON city.city_id = c.shipping_city
      LEFT JOIN country
        ON country.country_id = c.shipping_country
      LEFT JOIN state
        ON state.state_id = c.shipping_state
      LEFT JOIN ${tableConfig.users} AS u
        ON u.user_id = c.user_id
      LEFT JOIN ${tableConfig.order_cancel} AS oc
        ON oc.cart_item_id = ci.item_id
    WHERE c.cart_transaction_status = 1
      AND c.transaction_id = ${orderId}
    GROUP BY ci.item_id
  `;

  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return response;
};

// exports.getOrderDetails = async (transactionId) => {
//   console.log("transactionId : ", transactionId);
//   let query = `
//     SELECT
//       ${tableConfig.cart_items}.deal_id,
//       ${tableConfig.cart_items}.deal_key,
//       ${tableConfig.cart_items}.cart_id,
//       ${tableConfig.cart_items}.item_id,
//       ${tableConfig.cart_items}.deal_value,
//       ${tableConfig.cart_items}.item_quantity,
//       ${tableConfig.cart_items}.sub_product_id,
//       ${tableConfig.sub_products}.discount as currentPrice,
//       ${tableConfig.sub_products}.size_id,
//       ${tableConfig.sub_products}.sku,
//       ${tableConfig.size}.size_name,
//       products.deal_title,
//       products.deal_title_french,
//       CASE WHEN ${tableConfig.sub_products}.quantity > 0 THEN true ELSE false END AS inStock,
//       CONCAT("${PRODUCT_THUMP_DISPLAY_IMAGE}",${tableConfig.cart_items}.deal_key,"_1.png") as image
//     FROM ${tableConfig.cart}
//     LEFT JOIN ${tableConfig.cart_items} ON ${tableConfig.cart_items}.cart_id = ${tableConfig.cart}.cart_id
//     LEFT JOIN ${tableConfig.sub_products} ON ${tableConfig.sub_products}.id = ${tableConfig.cart_items}.sub_product_id
//     LEFT JOIN ( SELECT * FROM ${tableConfig.size} ) AS size ON size.size_id = sub_products.size_id
//     LEFT JOIN ( SELECT deal_id, deal_title, deal_title_french FROM ${tableConfig.product} WHERE deal_status = 1 ) AS products ON products.deal_id = ${tableConfig.cart_items}.deal_id
//     WHERE ${tableConfig.cart}.transaction_id = ${transactionId} AND ${tableConfig.cart}.cart_transaction_status != 1
//     GROUP BY ${tableConfig.cart_items}.item_id
//     ORDER BY ${tableConfig.cart_items}.item_id DESC;`;

//   let response = await global?.SEQUELIZE?.query(query, {
//     type: global?.SEQUELIZE?.QueryTypes?.SELECT,
//   });
//   console.log("quer fo detals button: ", response);
//   return response;
// };

exports.getOrderDetails = async (transactionId) => {
  let query = `
  
    SELECT 
  products.deal_title,
  products.deal_title_french,
  ${tableConfig.cart_items}.deal_id,
  ${tableConfig.cart_items}.deal_key,
  ${tableConfig.cart_items}.item_quantity,
  ${tableConfig.cart_items}.sub_product_id,
  ${tableConfig.sub_products}.discount AS currentPrice,
  ${tableConfig.sub_products}.size_id,
  ${tableConfig.sub_products}.sku,
  ${tableConfig.size}.size_name,
  CASE WHEN ${tableConfig.sub_products}.quantity > 0 THEN true ELSE false END AS inStock,
  CONCAT("${PRODUCT_THUMP_DISPLAY_IMAGE}", ${tableConfig.cart_items}.deal_key, "_1.png") AS image
FROM ${tableConfig.cart_items}
LEFT JOIN ${tableConfig.cart} ON ${tableConfig.cart_items}.cart_id = ${tableConfig.cart}.cart_id
LEFT JOIN ${tableConfig.sub_products} ON ${tableConfig.sub_products}.id = ${tableConfig.cart_items}.sub_product_id
LEFT JOIN ${tableConfig.size} ON ${tableConfig.size}.size_id = ${tableConfig.sub_products}.size_id
LEFT JOIN (
  SELECT deal_id, deal_title, deal_title_french 
  FROM ${tableConfig.product} 
  WHERE deal_status = 1
) AS products ON products.deal_id = ${tableConfig.cart_items}.deal_id
WHERE ${tableConfig.cart}.transaction_id = ${transactionId} 
ORDER BY ${tableConfig.cart_items}.item_id DESC;
`;
  try {
    const response = await global?.SEQUELIZE?.query(query, {
      type: global?.SEQUELIZE?.QueryTypes?.SELECT,
    });

    return response;
  } catch (error) {
    console.error("Error fetching order details: ", error);
    throw error;
  }
};

exports.getInvoicedetails = async (orderId) => {
  let query = `
    SELECT *,
      city.city_name       AS cityName,
      city.delivery_charge AS delivery_charge,
      state.state_name     AS stateName,
      country.country_name AS countryName,
      c.transaction_id     AS transid,
      oc.reason,
      oc.cancel_approved_by,
      oc.cancel_type,
      oc.cancel_status,
      oc.cancelled_on,
      ci.delivery_status,
      c.type,
      c.coupon_code,
      c.transaction_date,
      c.shipping_name      AS NAME,
      c.shipping_address   AS saddr1,
      c.shipping_address1  AS saddr2,
      c.shipping_city      AS city_name,
      c.shipping_phone     AS phone,
      c.coupon_code        AS phone,
      ci.item_color        AS product_color,
      ci.item_size         AS product_size,
      ci.filling_option,
      ci.filling_price,
      ci.item_quantity     AS quantity,
      c.delivery_price     AS shipping,
      c.coupon_apply,
      u.email              AS email,
      ci.item_id,
      c.transaction_id     AS package_number,
      c.discount_amount,
      c.promocode_dump     AS promocode,
      pl.method,
      pl.payment_id,
      c.delivery_period,
      ci.sku
    FROM ${tableConfig.cart} AS c
      LEFT JOIN ${tableConfig.cart_items} AS ci
        ON ci.cart_id = c.cart_id
      LEFT JOIN ${tableConfig.hesabe_payment_log} AS pl
        ON pl.cart_id = c.cart_id
      LEFT JOIN sub_products AS sub_products
        ON sub_products.id = ci.sub_product_id
      LEFT JOIN size AS size_new
        ON size_new.size_id = sub_products.size_id
      LEFT JOIN city
        ON city.city_id = c.shipping_city
      LEFT JOIN country
        ON country.country_id = c.shipping_country
      LEFT JOIN state
        ON state.state_id = c.shipping_state
      LEFT JOIN ${tableConfig.users} AS u
        ON u.user_id = c.user_id
      LEFT JOIN ${tableConfig.order_cancel} AS oc
        ON oc.cart_item_id = ci.item_id
    WHERE c.cart_transaction_status = 1
      AND c.transaction_id = ${orderId}
    GROUP BY ci.item_id
  `;

  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return response;
};

exports.getTrackIdByOrderID = async (orderId) => {
  let query = `SELECT DHL_shipmet_trackingID FROM ${tableConfig.cart} WHERE transaction_id = ${orderId}`;
  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return response;
};
