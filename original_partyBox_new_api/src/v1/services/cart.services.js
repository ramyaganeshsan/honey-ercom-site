const tableConfig = require("../database/table.config.json");
const {
  getMessage,
  currencyFormatter,
  getCurrentTimestamp,
  calculateProductDiscountAndSavings,
  serializeData,
} = require("../utils");
const { PRODUCT_THUMP_DISPLAY_IMAGE } = require("../utils/constants");

exports.getMyCartProducts = async (userId) => {
  let query = `SELECT 
        ${tableConfig.cart_items}.deal_id,
        ${tableConfig.cart_items}.deal_key,
        ${tableConfig.cart_items}.cart_id,
        ${tableConfig.cart_items}.item_id,
        ${tableConfig.cart_items}.deal_value,
        ${tableConfig.cart_items}.item_quantity,
        ${tableConfig.cart_items}.sub_product_id,
        ${tableConfig.sub_products}.discount as currentPrice,
        ${tableConfig.sub_products}.size_id,
        ${tableConfig.sub_products}.sku,
        ${tableConfig.size}.size_name,
        products.deal_title,
        products.deal_title_french,
        CASE WHEN ${tableConfig.sub_products}.quantity > 0 THEN true ELSE false END AS inStock,
        CONCAT("${PRODUCT_THUMP_DISPLAY_IMAGE}",${tableConfig.cart_items}.deal_key,"_1.png") as image
    FROM ${tableConfig.cart}
    LEFT JOIN ${tableConfig.cart_items} ON ${tableConfig.cart_items}.cart_id = ${tableConfig.cart}.cart_id
    LEFT JOIN ${tableConfig.sub_products} ON ${tableConfig.sub_products}.id = ${tableConfig.cart_items}.sub_product_id 
    LEFT JOIN ( SELECT * FROM ${tableConfig.size} ) AS size ON size.size_id = sub_products.size_id
    LEFT JOIN ( SELECT deal_id, deal_title, deal_title_french FROM ${tableConfig.product} WHERE deal_status = 1 ) AS products ON products.deal_id = ${tableConfig.cart_items}.deal_id
    WHERE ${tableConfig.cart}.user_id = ${userId} AND ${tableConfig.cart}.cart_transaction_status != 1
    GROUP BY ${tableConfig.cart_items}.item_id 
    ORDER BY ${tableConfig.cart_items}.item_id DESC;`;

  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });

  return response;
};

/* UPDATE CART DETAILS */
exports.updateCart = async ({ products, userDetails }) => {
  let transaction = await global.SEQUELIZE.transaction();

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

    let selectConfig = {
      type: global?.SEQUELIZE?.QueryTypes?.SELECT,
      transaction: transaction,
    };
    let updateConfig = {
      type: global?.SEQUELIZE?.QueryTypes?.UPDATE,
      transaction: transaction,
    };
    let deleteConfig = {
      type: global?.SEQUELIZE?.QueryTypes?.DELETE,
      transaction: transaction,
    };

    /* Extract sub product ID'S */
    products?.forEach((product) => {
      subProductIds.push(Number(product.sub_product_id));
      productMap[product?.sub_product_id] = product;
    });

    /* Check weather user have active cart */
    let userCartDetails = await getUserCartDetails(userDetails, selectConfig);
    if (!userCartDetails || userCartDetails.length === 0) {
      throw new Error(getMessage("cart_not_found"));
    }

    let cartId = userCartDetails[0]["cart_id"];

    if (!cartId) {
      throw new Error(getMessage("cart_not_found"));
    }

    let productDetails = await getSubProductDetails(
      subProductIds,
      selectConfig
    );

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
      let response = await updateCartItems(
        cartItem.item_id,
        cartItem,
        updateConfig
      );
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
      grandCartTotal,
      updateConfig
    );
    if (cartResponse === -1) {
      throw new Error(getMessage("something_went_wrong_error"));
    }
    await deleteRemovedProducts(cartId, validProductIds, deleteConfig);

    await transaction.commit();
    return { status: 1, totalCartProducts: totalCartProducts };
  } catch (err) {
    await transaction.rollback();
    console.log(err);
    return { status: 0, totalCartProducts: 0 };
  }
};

const getUserCartDetails = async (userDetails, selectConfig) => {
  let selectUserCartDetailsQuery = `SELECT cart_id, total_cart_items FROM ${tableConfig.cart} WHERE user_id = ${userDetails?.user_id} AND cart_transaction_status = 0`;
  let userCartDetails = await global?.SEQUELIZE?.query(
    selectUserCartDetailsQuery,
    selectConfig
  );

  return userCartDetails;
};

const getSubProductDetails = (subProductIds, selectConfig) => {
  let query = `SELECT 
      product_id,
      id,
      deal_title,
      deal_title_french,
      ${tableConfig.sub_products}.discount AS sub_product_value,
      ${tableConfig.sub_products}.price AS sub_product_price,
      ${tableConfig.sub_products}.quantity AS sub_product_quantity
    FROM ${tableConfig.sub_products}
    JOIN product ON ${tableConfig.sub_products}.product_id = ${
    tableConfig.product
  }.deal_id
    WHERE ${tableConfig.sub_products}.id IN (${subProductIds.join(",")});`;

  let response = global?.SEQUELIZE?.query(query, selectConfig);
  return response;
};

const deleteRemovedProducts = async (cartId, validProductIds, deleteConfig) => {
  let query = `DELETE FROM ${
    tableConfig.cart_items
  } WHERE cart_id = ${cartId} AND sub_product_id NOT IN (${validProductIds.join(
    ","
  )})`;
  let response = await global?.SEQUELIZE?.query(query, deleteConfig);
  return response;
};

const updateCartItems = async (itemId, productDetails, transaction) => {
  let cartItemsUpdateQuery = `UPDATE ${tableConfig.cart_items} SET
    item_quantity = ${productDetails.item_quantity},
    deal_value = ${Number(productDetails.deal_value)},
    deal_price = ${Number(productDetails.deal_price)},
    deal_savings = ${Number(productDetails.deal_savings)},
    deal_percentage = ${Number(productDetails.deal_percentage)}
    WHERE item_id = ${Number(itemId)}`;

  try {
    let [result, modified] = await global?.SEQUELIZE?.query(
      cartItemsUpdateQuery,
      transaction
    );
    return modified;
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
  grandTotalPrice,
  transaction
) => {
  let cartUpdateQuery = `UPDATE ${tableConfig.cart} SET
    total_cart_items = ${Number(totalCartItems)},
    total_cart_price = ${Number(totalCartPrice)},
    delivery_price = ${Number(deliveryPrice)},
    grand_total_price = ${Number(grandTotalPrice)}
    WHERE cart_id = ${Number(cartId)}`;

  try {
    let [result, modified] = await global?.SEQUELIZE?.query(
      cartUpdateQuery,
      transaction
    );
    return modified;
  } catch (err) {
    console.log(err?.message);
    return -1;
  }
};

/* END OF UPDATE CART DETAILS FUNCTION */

/* ADD TO CART FUNCTION */
// exports.addToCart = async (
//   cartProductDetails,
//   userDetails,
//   fromSession = false
// ) => {
//   let transaction = await global.SEQUELIZE?.transaction();

//   try {
//     let { dealId, quantity, sizeId } = cartProductDetails;

//     if (isNaN(quantity) || quantity <= 0) {
//       return { status: -1, message: "Invalid quantity" };
//     }

//     let totalPrice = 0;
//     let totalCartProducts = 0;
//     let subProductId = "";

//     let selectConfig = {
//       type: global?.SEQUELIZE?.QueryTypes?.SELECT,
//       transaction: transaction,
//     };
//     let updateConfig = {
//       type: global?.SEQUELIZE?.QueryTypes?.UPDATE,
//       transaction: transaction,
//     };
//     let insertConfig = {
//       type: global?.SEQUELIZE?.QueryTypes?.INSERT,
//       transaction: transaction,
//     };

//     let productDetailsQuery = `SELECT
//     deal_title,
//     deal_title_french,
//     url_title,
//     deal_key,
//     deal_description,
//     deal_description_french,
//     deal_price,
//     deal_savings,
//     deal_percentage,
//     deal_value,
//     having_size_color,
//     user_limit_quantity,
//     deal_status FROM ${tableConfig?.product} WHERE deal_id = ${dealId} AND deal_status = 1`;

//     let productDetails = await global?.SEQUELIZE?.query(
//       productDetailsQuery,
//       selectConfig
//     );
//     // Check product is available or not.
//     if ((!productDetails || productDetails?.length <= 0) && !sizeId) {
//       return { status: -1, message: getMessage("product_not_found") };
//     }

//     // Check product quantity is available
//     if (
//       (productDetails?.length > 0 &&
//         productDetails[0]["user_limit_quantity"] <= 0 &&
//         !fromSession) ||
//       (productDetails?.length > 0 &&
//         productDetails[0]["user_limit_quantity"] > 0 &&
//         productDetails[0]["user_limit_quantity"] < quantity &&
//         !sizeId &&
//         !fromSession)
//     ) {
//       return {
//         status: -1,
//         message: getMessage("product_quantity_is_not_enough").replace(
//           "##PRODUCT_NAME##",
//           productDetails[0]["deal_title"]
//         ),
//       };
//     }

//     if (productDetails[0]["deal_value"] && !sizeId) {
//       totalPrice = currencyFormatter(
//         quantity * productDetails[0]["deal_value"]
//       );
//       if (isNaN(totalPrice)) totalPrice = 0;
//     }

//     /* Check whether user already has a cart */
//     let userCartDetails = await getUserCartDetails(userDetails, selectConfig);
//     let cartId = "";
//     if (
//       userCartDetails &&
//       userCartDetails.length > 0 &&
//       userCartDetails[0]["cart_id"]
//     ) {
//       cartId = userCartDetails[0]["cart_id"];
//     }

//     let subProductDetailsQuery = `SELECT id, product_id, quantity, price, discount, quantity, sku FROM ${
//       tableConfig.sub_products
//     } WHERE product_id = ${Number(dealId)}`;

//     if (sizeId !== "" && !isNaN(sizeId)) {
//       subProductDetailsQuery += ` AND size_id = ${Number(sizeId)}`;
//     }

//     let subProductDetails = await global?.SEQUELIZE?.query(
//       subProductDetailsQuery,
//       selectConfig
//     );

//     if (!subProductDetails || subProductDetails?.length <= 0) {
//       return { status: -1, message: getMessage("product_not_found") };
//     }

//     if (sizeId !== "" && !isNaN(sizeId)) {
//       // Check product is available or not.
//       if (!subProductDetails || subProductDetails?.length <= 0) {
//         return { status: -1, message: getMessage("product_not_found") };
//       }

//       // Check product quantity is available
//       if (
//         (subProductDetails?.length > 0 &&
//           subProductDetails[0]["quantity"] <= 0) ||
//         (subProductDetails?.length > 0 &&
//           subProductDetails[0]["quantity"] > 0 &&
//           subProductDetails[0]["quantity"] < quantity)
//       ) {
//         return {
//           status: -1,
//           message: getMessage("product_quantity_is_not_enough").replace(
//             "##PRODUCT_NAME##",
//             productDetails[0]["deal_title"]
//           ),
//         };
//       }

//       subProductId = subProductDetails[0]["id"];

//       if (subProductDetails[0]["discount"]) {
//         totalPrice = currencyFormatter(
//           quantity * subProductDetails[0]["discount"]
//         );
//         if (isNaN(totalPrice)) totalPrice = 0;
//       }
//     }
//     if (!cartId) {
//       totalCartProducts = 1;

//       let insertedId = await insertCartDetails(
//         userDetails,
//         totalPrice,
//         insertConfig
//       );

//       await insertProductIntoCartItems(
//         insertedId,
//         dealId,
//         quantity,
//         userDetails,
//         productDetails,
//         subProductDetails,
//         insertConfig
//       );
//     } else {
//       // Check if the product is already in the cart

//       let cartItemQuery = `SELECT item_quantity FROM ${tableConfig.cart_items} WHERE cart_id = ${cartId} AND deal_id = ${dealId}`;

//       if (subProductId !== "" && !isNaN(subProductId)) {
//         cartItemQuery += ` AND sub_product_id = '${subProductId}'`;
//       }
//       let cartItemDetails = await global?.SEQUELIZE?.query(
//         cartItemQuery,
//         selectConfig
//       );

//       // Product exists in cart, update its quantity

//       if (cartItemDetails && cartItemDetails.length > 0) {
//         let newQuantity = cartItemDetails[0]["item_quantity"] + quantity;
//         let updateCartItemQuery = `UPDATE ${tableConfig.cart_items} SET item_quantity = ${newQuantity} WHERE cart_id = ${cartId} AND deal_id = ${dealId}`;
//         if (subProductId !== "" && !isNaN(subProductId)) {
//           updateCartItemQuery += ` AND sub_product_id = '${subProductId}'`;
//         }
//         await global?.SEQUELIZE?.query(updateCartItemQuery, updateConfig);

//         /* Update Cart Total Price and Quantity */
//         let updateCartPriceDetailsQuery = `UPDATE ${
//           tableConfig.cart
//         } SET total_cart_price = total_cart_price + ${Number(
//           totalPrice
//         )}, grand_total_price = grand_total_price + ${Number(
//           totalPrice
//         )} WHERE cart_id = ${cartId} AND cart_transaction_status = 0`;
//         await global?.SEQUELIZE?.query(
//           updateCartPriceDetailsQuery,
//           updateConfig
//         );

//         totalCartProducts += Number(userCartDetails[0]["total_cart_items"]);
//       } else {
//         // Product does not exist in cart, insert a new entry
//         await insertProductIntoCartItems(
//           cartId,
//           dealId,
//           quantity,
//           userDetails,
//           productDetails,
//           subProductDetails,
//           insertConfig
//         );

//         /* Update Cart Total Price and Quantity */
//         let updateCartPriceDetailsQuery = `UPDATE ${
//           tableConfig.cart
//         } SET total_cart_items = total_cart_items + 1, total_cart_price = total_cart_price + ${Number(
//           totalPrice
//         )}, grand_total_price = grand_total_price + ${Number(
//           totalPrice
//         )} WHERE cart_id = ${cartId} AND cart_transaction_status = 0`;
//         await global?.SEQUELIZE?.query(
//           updateCartPriceDetailsQuery,
//           updateConfig
//         );

//         totalCartProducts += Number(userCartDetails[0]["total_cart_items"]) + 1;
//       }
//     }

//     transaction.commit();
//     return { status: 1, totalCartProducts: totalCartProducts };
//   } catch (err) {
//     console.log(err);
//     await transaction.rollback();
//     return { status: 0, totalCartProducts: 0 };
//   }
// };

exports.addToCart = async (
  cartProductDetails,
  userDetails,
  fromSession = false
) => {
  let transaction = await global.SEQUELIZE?.transaction();

  try {
    let { dealId, quantity, sizeId } = cartProductDetails;

    if (isNaN(quantity) || quantity <= 0) {
      return { status: -1, message: "Invalid quantity" };
    }

    let totalPrice = 0;
    let totalCartProducts = 0;
    let subProductId = "";

    let selectConfig = {
      type: global?.SEQUELIZE?.QueryTypes?.SELECT,
      transaction: transaction,
    };
    let updateConfig = {
      type: global?.SEQUELIZE?.QueryTypes?.UPDATE,
      transaction: transaction,
    };
    let insertConfig = {
      type: global?.SEQUELIZE?.QueryTypes?.INSERT,
      transaction: transaction,
    };

    let productDetailsQuery = `SELECT 
    deal_title,
    deal_title_french,
    url_title,
    deal_key,
    deal_description,
    deal_description_french,
    deal_price,
    deal_savings,
    deal_percentage,
    deal_value,
    having_size_color,
    user_limit_quantity,
    deal_status FROM ${tableConfig?.product} WHERE deal_id = ${dealId} AND deal_status = 1`;

    let productDetails = await global?.SEQUELIZE?.query(
      productDetailsQuery,
      selectConfig
    );
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

    if (productDetails[0]["deal_value"] && !sizeId) {
      totalPrice = currencyFormatter(
        quantity * productDetails[0]["deal_value"]
      );
      if (isNaN(totalPrice)) totalPrice = 0;
    }

    let userCartDetails = await getUserCartDetails(userDetails, selectConfig);
    let cartId = "";
    if (
      userCartDetails &&
      userCartDetails.length > 0 &&
      userCartDetails[0]["cart_id"]
    ) {
      cartId = userCartDetails[0]["cart_id"];
    }

    let subProductDetailsQuery = `SELECT id, product_id, quantity, price, discount, quantity, sku FROM ${
      tableConfig.sub_products
    } WHERE product_id = ${Number(dealId)}`;

    if (sizeId !== "" && !isNaN(sizeId)) {
      subProductDetailsQuery += ` AND size_id = ${Number(sizeId)}`;
    }

    let subProductDetails = await global?.SEQUELIZE?.query(
      subProductDetailsQuery,
      selectConfig
    );

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

      let insertedId = await insertCartDetails(
        userDetails,
        totalPrice,
        insertConfig
      );

      await insertProductIntoCartItems(
        insertedId,
        dealId,
        quantity,
        userDetails,
        productDetails,
        subProductDetails,
        insertConfig
      );
    } else {
      let cartItemQuery = `SELECT item_quantity FROM ${tableConfig.cart_items} WHERE cart_id = ${cartId} AND deal_id = ${dealId}`;

      if (subProductId !== "" && !isNaN(subProductId)) {
        cartItemQuery += ` AND sub_product_id = '${subProductId}'`;
      }
      let cartItemDetails = await global?.SEQUELIZE?.query(
        cartItemQuery,
        selectConfig
      );

      if (cartItemDetails && cartItemDetails.length > 0) {
        let newQuantity = cartItemDetails[0]["item_quantity"] + quantity;
        let updateCartItemQuery = `UPDATE ${tableConfig.cart_items} SET item_quantity = ${newQuantity} WHERE cart_id = ${cartId} AND deal_id = ${dealId}`;
        if (subProductId !== "" && !isNaN(subProductId)) {
          updateCartItemQuery += ` AND sub_product_id = '${subProductId}'`;
        }
        await global?.SEQUELIZE?.query(updateCartItemQuery, updateConfig);

        let updateCartPriceDetailsQuery = `UPDATE ${
          tableConfig.cart
        } SET total_cart_price = total_cart_price + ${Number(
          totalPrice
        )}, grand_total_price = grand_total_price + ${Number(
          totalPrice
        )} WHERE cart_id = ${cartId} AND cart_transaction_status = 0`;
        await global?.SEQUELIZE?.query(
          updateCartPriceDetailsQuery,
          updateConfig
        );

        totalCartProducts += Number(userCartDetails[0]["total_cart_items"]);
      } else {
        await insertProductIntoCartItems(
          cartId,
          dealId,
          quantity,
          userDetails,
          productDetails,
          subProductDetails,
          insertConfig
        );

        let updateCartPriceDetailsQuery = `UPDATE ${
          tableConfig.cart
        } SET total_cart_items = total_cart_items + 1, total_cart_price = total_cart_price + ${Number(
          totalPrice
        )}, grand_total_price = grand_total_price + ${Number(
          totalPrice
        )} WHERE cart_id = ${cartId} AND cart_transaction_status = 0`;
        await global?.SEQUELIZE?.query(
          updateCartPriceDetailsQuery,
          updateConfig
        );

        totalCartProducts += Number(userCartDetails[0]["total_cart_items"]) + 1;
      }
    }

    transaction.commit();
    return { status: 1, totalCartProducts: totalCartProducts };
  } catch (err) {
    console.log(err);
    await transaction.rollback();
    return { status: 0, totalCartProducts: 0 };
  }
};

const insertProductIntoCartItems = async (
  cartId,
  dealId,
  quantity,
  userDetails,
  productDetails,
  subProductDetails,
  insertConfig
) => {
  console.log("subProductDetails : ", subProductDetails);
  console.log("productDetails : ", productDetails);

  let cartItemsQuery = `INSERT INTO ${tableConfig.cart_items} ( 
    cart_id, cart_userid, is_item_customized, item_color, item_color_code, item_size, color_name, size_name, item_quantity, item_custom_details, item_custom_image, deal_id, sub_product_id, deal_title, deal_title_french, url_title, deal_key, deal_description, deal_description_french, shop_id, deal_value, deal_price, deal_savings, deal_percentage, deal_status, created_date, error_message, errors, cart_transaction_status, admin_status, delivery_status, shipping_date, sku, quantity_update_status, filling_option, filling_price ) VALUES (  
    ${Number(cartId)}, 
    ${Number(userDetails?.user_id)}, 
    0, 
    0, 
    ${null}, 
    0, 
    "", 
    "", 
    ${Number(quantity)}, 
    "", 
    "", 
    ${Number(dealId)},
    ${Number(subProductDetails[0]["id"])},
    '${productDetails[0]["deal_title"]?.replace(/[']+/g, " ")}', 
    '${productDetails[0]["deal_title_french"]?.replace(/[']+/g, " ")}', 
    '${productDetails[0]["url_title"]?.replace(/[']+/g, " ")}', 
    '${productDetails[0]["deal_key"]?.replace(/[']+/g, " ")}', 
    '${productDetails[0]["deal_description"]?.replace(/[']+/g, " ")}', 
    '${productDetails[0]["deal_description_french"]?.replace(/[']+/g, " ")}', 
    1, 
    ${Number(subProductDetails[0]["discount"])}, 
    ${Number(subProductDetails[0]["price"])}, 
    ${Number(productDetails[0]["deal_savings"])}, 
    ${Number(productDetails[0]["deal_percentage"])}, 
    ${Number(productDetails[0]["deal_status"])}, 

    ${getCurrentTimestamp()}, 
    "", 
    0, 
    0, 
    0, 
    0, 
    0, 
    "${subProductDetails[0]["sku"]?.replace(/[']+/g, " ")}", 
    0, 
    0, 
    0);
  `;

  let [insertedCartId] = await global?.SEQUELIZE?.query(
    cartItemsQuery,
    insertConfig
  );

  if (!insertedCartId) {
    throw new Error(getMessage("something_went_wrong_error"));
  }

  return insertedCartId;
};

// const checkIfProductAlreadyInUserCart = async (
//   cartId,
//   productId,
//   subProductId,
//   selectConfig
// ) => {
//   let query = `SELECT COUNT(deal_id) AS productCount FROM cart_items WHERE cart_id = ${cartId} AND deal_id = ${productId}`;
//   if (subProductId && !isNaN(subProductId)) {
//     query += ` AND sub_product_id = ${Number(subProductId)}`;
//   }
//   let response = await global?.SEQUELIZE?.query(query, selectConfig);
//   return response && response.length > 0 && response[0]["productCount"] > 0
//     ? true
//     : false;
// };

const insertCartDetails = async (userDetails, totalPrice, insertConfig) => {
  let cartInsertQuery = `INSERT INTO ${tableConfig.cart} (
    tax_amount, user_id, total_cart_items, total_cart_price, cancel_amount, is_cancel, delivery_type, delivery_price, delivery_period, delivery_terms, delivery_terms_arabic, grand_total_price, created_on, cart_transaction_status, transaction_id, tracking_id, shipping_name, shipping_address, shipping_address1, shipping_phone, shipping_city, shipping_state, shipping_country, shipping_zip,shipping_date, transaction_date, shipping_time, billing_info, order_date, shipping_log, type, gateway_opened, gateway_opened_time, coupon_code, coupon_apply, wallet_apply, wallet_amount, coupon_percentage, payment_status, notes, discount_amount, promocode_dump ) VALUES ( 
    0,
    ${userDetails?.user_id}, 
    1, 
    ${totalPrice}, 
    0, 
    0, 
    1, 
    0, 
    0, 
    "", 
    "", 
    ${totalPrice}, 
    ${getCurrentTimestamp()}, 
    0, 
    "", 
    "" , 
    "", 
    "", 
    "", 
    "", 
    "", 
    "", 
    "", 
    "", 
    "", 
    "", 
    "", 
    "", 
    "", 
    "", 
    0, 
    0, 
    "", 
    "", 
    0, 
    0, 
    0, 
    0, 
    0, 
    "", 
    0, 
    ${null} 
  )`;

  let [insertedId] = await global?.SEQUELIZE?.query(
    cartInsertQuery,
    insertConfig
  );

  if (!insertedId) {
    throw new Error(getMessage("something_went_wrong_error"));
  }

  return insertedId;
};
/* END OF ADD TO CART FUNCTION */

exports.removeAllCartProducts = async (userDetails) => {
  let transaction = await global.SEQUELIZE.transaction();
  try {
    let selectConfig = {
      type: global?.SEQUELIZE?.QueryTypes?.SELECT,
      transaction: transaction,
    };

    let userCartDetails = await getUserCartDetails(userDetails, selectConfig);

    if (!userCartDetails || userCartDetails.length === 0) {
      return { status: 1, message: getMessage("empty_cart_message") };
    }

    let cartId = userCartDetails[0]["cart_id"];

    if (!cartId) {
      throw new Error(getMessage("cart_not_found"));
    }

    /* Delete cart details and cartItems */
    let deleteConfig = {
      transaction: transaction,
    };
    let cartDeleteQuery = `DELETE FROM ${tableConfig.cart} WHERE cart_id = ${cartId}`;
    let cartItemsdeleteQuery = `DELETE FROM ${tableConfig.cart_items} WHERE cart_id = ${cartId}`;

    await global?.SEQUELIZE?.query(cartDeleteQuery, deleteConfig);
    await global?.SEQUELIZE?.query(cartItemsdeleteQuery, deleteConfig);

    await transaction.commit();
    return { status: 1 };
  } catch (err) {
    await transaction.rollback();
    console.log(err);
    return { status: 0, message: err?.message };
  }
};

exports.updateCartSession = async (sessionID, cartDetails) => {
  try {
    let query = `UPDATE ${tableConfig.sessions} SET cart='${cartDetails}' WHERE session_id="${sessionID}"`;
    await global?.SEQUELIZE?.query(query, {
      type: global?.SEQUELIZE?.QueryTypes?.UPDATE,
    });
    return 1;
  } catch (err) {
    console.log(err);
    return 0;
  }
};

exports.getCartDetailsUsingSessionDetails = async (cartDetails) => {
  if (cartDetails && cartDetails.length > 0) {
    let productIds = cartDetails.map((cartDetail) => Number(cartDetail.dealId));
    let query = `
      SELECT 
        product.deal_id,
        product.deal_key,
        product.deal_value, 
        product.deal_title,
        product.deal_title_french,
        sub_products.id as sub_product_id,
        sub_products.discount as currentPrice,
        sub_products.size_id,
        size.size_name,
        sub_products.sku,
        CASE WHEN sub_products.quantity > 0 THEN true ELSE false END AS inStock,
        CONCAT("${PRODUCT_THUMP_DISPLAY_IMAGE}",${tableConfig.product}.deal_key,"_1.png") as image
      FROM ${tableConfig.product}
      LEFT JOIN 
          ( 
              SELECT * 
              FROM ${tableConfig.sub_products} 
              WHERE `;

    for (let i = 0; i < cartDetails.length; i++) {
      let cartDetail = cartDetails[i];
      query += ` product_id = ${cartDetail.dealId} AND size_id = ${
        cartDetail["sizeId"] ? cartDetail["sizeId"] : 0
      }`;
      if (i < cartDetails.length - 1) {
        query += " OR ";
      }
    }
    query += `)
          AS sub_products ON sub_products.product_id = product.deal_id
      LEFT JOIN (
          SELECT *
          FROM size
      ) AS size ON size.size_id = sub_products.size_id
      WHERE product.deal_id IN (${productIds.join(",")});
    `;

    let response = await global?.SEQUELIZE?.query(query, {
      type: global?.SEQUELIZE?.QueryTypes?.SELECT,
    });
    return response;
  }
  return [];
};

exports.removeCartDetailsFromSession = async (sessionID) => {
  try {
    let serializeCartDetails = serializeData([]);
    let query = `UPDATE ${tableConfig.sessions} SET cart='${serializeCartDetails}' WHERE session_id = '${sessionID}' AND isMovedToUsers = 0`;
    await global?.SEQUELIZE?.query(query, {
      type: global?.SEQUELIZE?.QueryTypes?.UPDATE,
    });
    return { status: 1 };
  } catch (err) {
    console.log(err);
    return { status: 0 };
  }
};

exports.getSessionCartProductDetails = async (subProductId) => {
  let response = await getSubProductDetails(subProductId, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return response;
};

exports.getProductDetailSession = async (dealId, sizeId) => {
  let query = `
    SELECT 
      quantity,
      ${tableConfig.product}.deal_title
    FROM ${tableConfig.sub_products}
    JOIN ${tableConfig.product} ON ${tableConfig.product}.deal_id = ${tableConfig.sub_products}.product_id
    WHERE product_id = ${dealId}`;

  if (sizeId && !isNaN(sizeId)) {
    query += ` AND size_id = ${Number(sizeId)}`;
  }
  query += ` AND deal_status = 1;`;
  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return response;
};
