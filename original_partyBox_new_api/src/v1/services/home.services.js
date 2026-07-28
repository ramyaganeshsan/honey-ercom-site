const {
  BANNER_IMAGE_URL,
  PRODUCT_DISPLAY_IMAGE,
} = require("../utils/constants");
const sequelize = require("sequelize");
const { Op } = sequelize;
const tableConfig = require("../database/table.config.json");

const { cart, users } = require("../models");
const {
  getValueFromRedis,
  setValueRedis,
  stringifyData,
  parseData,
} = require("../utils");
const { query } = require("winston");

exports.getBannerImage = async () => {
  let bannerImages = await getValueFromRedis("bannerImages");
  if (bannerImages) {
    let parsedResponse = parseData(bannerImages);
    if (parsedResponse?.status) return parsedResponse?.data;
  }

  let query = `SELECT banner_id, image_title, redirect_url, CONCAT("${BANNER_IMAGE_URL}", banner_id, ".png") as url FROM ${tableConfig.banner_image} WHERE status = 1 AND home = 1 ORDER BY banner_id DESC LIMIT 5;`;
  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });

  let stringifyResponse = stringifyData(response);
  if (stringifyResponse?.status) {
    await setValueRedis("bannerImages", stringifyResponse?.data, 300);
  }

  return response;
};

exports.getCategories = async () => {
  let homeCategories = await getValueFromRedis("homeCategories");
  if (homeCategories) {
    let parsedResponse = parseData(homeCategories);
    if (parsedResponse?.status) return parsedResponse?.data;
  }

  let query = `SELECT category_id, category_name, category_name_french,main_category_id, sub_category_id FROM ${tableConfig.category} WHERE category_status = 1 ORDER BY main_category_id ASC;`;

  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });

  let categories = {};
  let subSubCategories = [];
  response.forEach((element) => {
    if (
      Number(element?.main_category_id) === 0 &&
      Number(element?.sub_category_id) === 0
    ) {
      element["category"] = {};
      categories[element?.category_id] = element;
    } else if (
      Number(element?.main_category_id) === Number(element?.sub_category_id) &&
      categories[element?.main_category_id] !== undefined
    ) {
      element["category"] = [];
      categories[element?.main_category_id]["category"][element?.category_id] =
        element;
    } else if (
      Number(element?.main_category_id) !== Number(element?.sub_category_id) &&
      categories[element?.main_category_id] !== undefined &&
      categories[element?.main_category_id]["category"] !== undefined &&
      categories[element?.main_category_id]["category"][
        element?.sub_category_id
      ] !== undefined
    ) {
      element["category"] = [];
      categories[element?.main_category_id]["category"][
        element?.sub_category_id
      ]["category"].push(element);
    } else {
      subSubCategories.push(element);
    }
  });

  let categoryWithSubCategories = Object.values(categories);

  for (let index = 0; index < categoryWithSubCategories.length; index++) {
    const element = categoryWithSubCategories[index];
    if (element?.category) {
      categoryWithSubCategories[index]["category"] = Object.values(
        element["category"]
      );
    }
  }

  for (
    let subSubCategoryIndex = 0;
    subSubCategoryIndex < subSubCategories.length;
    subSubCategoryIndex++
  ) {
    let thirdLevelSubCategory = subSubCategories[subSubCategoryIndex];

    for (
      let mainCategoryIndex = 0;
      mainCategoryIndex < categoryWithSubCategories.length;
      mainCategoryIndex++
    ) {
      let firstLevelSubCategory =
        categoryWithSubCategories[mainCategoryIndex]["category"];
      for (
        let firstSubCategoryIndex = 0;
        firstSubCategoryIndex < firstLevelSubCategory.length;
        firstSubCategoryIndex++
      ) {
        let secondSubCategory =
          firstLevelSubCategory[firstSubCategoryIndex]["category"];
        for (
          let secondSubCategoryIndex = 0;
          secondSubCategoryIndex < secondSubCategory.length;
          secondSubCategoryIndex++
        ) {
          if (
            Number(secondSubCategory[secondSubCategoryIndex]["category_id"]) ===
            thirdLevelSubCategory.sub_category_id
          ) {
            categoryWithSubCategories[mainCategoryIndex]["category"][
              firstSubCategoryIndex
            ]["category"][secondSubCategoryIndex]["category"].push(
              thirdLevelSubCategory
            );
          }
        }
      }
    }
  }

  let stringifyResponse = stringifyData(response);
  if (stringifyResponse?.status) {
    await setValueRedis("homeCategories", stringifyResponse.data, 300);
  }

  return categoryWithSubCategories;
};

exports.getProducts = async () => {
  let newProducts = await getValueFromRedis("newProducts");
  if (newProducts) {
    let parsedResponse = parseData(newProducts);
    if (parsedResponse?.status) return parsedResponse?.data;
  }

  let query = `SELECT deal_id, deal_title, deal_title_french ,deal_key, deal_price, 
deal_value, having_size_color, CONCAT("${PRODUCT_DISPLAY_IMAGE}",deal_key,"_1.png") as image ,
CASE WHEN user_limit_quantity > 0 THEN true ELSE false END AS inStock, 
AVG(${tableConfig.rate_review}.rating) AS ratings FROM ${tableConfig.product} 
LEFT JOIN ${tableConfig.rate_review} ON ${tableConfig.product}.deal_id=${tableConfig.rate_review}.type_id 
AND ${tableConfig.rate_review}.approve_status=1 WHERE deal_status = 1 
AND category_id != 720
GROUP BY deal_id ORDER BY deal_id DESC LIMIT 8`;

  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });

  let stringifyResponse = stringifyData(response);
  if (stringifyResponse?.status) {
    await setValueRedis("newProducts", stringifyResponse.data, 300);
  }
  return response;
};

exports.getBestSellingProducts = async () => {
  let bestSellingProducts = await getValueFromRedis("bestSellingProducts");
  if (bestSellingProducts) {
    let parsedResponse = parseData(bestSellingProducts);
    if (parsedResponse?.status) return parsedResponse?.data;
  }

  let query = `SELECT deal_id, deal_title, deal_title_french, deal_key, deal_price, deal_value, having_size_color, CONCAT("${PRODUCT_DISPLAY_IMAGE}",deal_key,"_1.png") as image ,CASE WHEN user_limit_quantity > 0 THEN true ELSE false END AS inStock, AVG(${tableConfig.rate_review}.rating) AS ratings FROM ${tableConfig.product} LEFT JOIN ${tableConfig.rate_review} ON ${tableConfig.product}.deal_id=${tableConfig.rate_review}.type_id AND ${tableConfig.rate_review}.approve_status=1 WHERE deal_status = 1 GROUP BY deal_id ORDER BY purchase_count DESC LIMIT 8`;

  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });

  let stringifyResponse = stringifyData(response);
  if (stringifyResponse?.status) {
    await setValueRedis("bestSellingProducts", stringifyResponse.data, 300);
  }
  return response;
};

exports.getOfferProducts = async () => {
  let offerProducts = await getValueFromRedis("offerProducts");
  if (offerProducts) {
    let parsedResponse = parseData(offerProducts);
    if (parsedResponse?.status) return parsedResponse?.data;
  }

  let query = `SELECT deal_id, deal_title, deal_title_french, deal_key, deal_price, deal_value, having_size_color, CONCAT("${PRODUCT_DISPLAY_IMAGE}",deal_key,"_1.png") as image ,CASE WHEN user_limit_quantity > 0 THEN true ELSE false END AS inStock, AVG(${tableConfig.rate_review}.rating) AS ratings FROM ${tableConfig.product} LEFT JOIN ${tableConfig.rate_review} ON ${tableConfig.product}.deal_id=${tableConfig.rate_review}.type_id AND ${tableConfig.rate_review}.approve_status=1 
  WHERE deal_status = 1 
  AND category_id = 720
  GROUP BY deal_id ORDER BY purchase_count DESC LIMIT 8`;

  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });

  let stringifyResponse = stringifyData(response);
  if (stringifyResponse?.status) {
    await setValueRedis("offerProducts", stringifyResponse.data, 120);
  }
  return response;
};

exports.getUserCartProductCount = async (userId) => {
  let condition = {
    user_id: Number(userId),
    cart_transaction_status: { [Op.not]: 1 },
  };
  let filter = {
    where: condition,
    attributes: ["total_cart_items"],
    // include: [
    //   {
    //     model: cart_items,
    //     attributes: ["deal_id"],
    //   },
    // ],
  };

  // let response = await cart.count(filter);
  // return response;
  let response = await cart.findOne(filter);
  return response?.total_cart_items ?? 0;
};

exports.getUserWishListCount = async (userId) => {
  let condition = {
    user_id: Number(userId),
  };
  let filter = {
    where: condition,
    attributes: ["wishlist"],
    raw: true,
  };
  let response = await users.findOne(filter);
  return response;
};

exports.getUserCartAndWishlistCountSession = async (sessionID) => {
  let query = `SELECT wishlist, cart FROM ${tableConfig.sessions} WHERE session_id = "${sessionID}" AND isMovedToUsers = 0`;
  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return response;
};
