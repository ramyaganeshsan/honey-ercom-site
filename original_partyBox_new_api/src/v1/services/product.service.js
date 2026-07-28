const tableConfig = require("../database/table.config.json");
const {
  getValueFromRedis,
  stringifyData,
  setValueRedis,
  parseData,
} = require("../utils");
const { PRODUCT_DISPLAY_IMAGE } = require("../utils/constants");

exports.getProducts = async ({
  rate_review = "",
  name = "",
  min = 0,
  max = 20000,
  pageNumber = 0,
  pageSize = 20,
  m_c: firstLevelCategory = 0,
  s_c: secondLevelCategory = 0,
  sl_c: thirdLevelCategory = 0,
  sort_by = "",
}) => {
  if (min == "" || isNaN(min)) {
    min = 0;
  }

  if (max == "" || isNaN(max)) {
    max = 20000;
  }

  if (pageNumber == "" || isNaN(pageNumber)) {
    pageNumber = 0;
  }

  if (pageSize == "" || isNaN(pageSize)) {
    pageSize = 20;
  }

  let baseQuery = `SELECT deal_id, having_size_color,deal_title, deal_title_french ,deal_key, deal_price, deal_value, CONCAT("${PRODUCT_DISPLAY_IMAGE}",deal_key,"_1.png") as image, CASE WHEN user_limit_quantity > 0 THEN true ELSE false END AS inStock, AVG(${tableConfig.rate_review}.rating) AS ratings FROM ${tableConfig.product} LEFT JOIN ${tableConfig.rate_review} ON ${tableConfig.product}.deal_id=${tableConfig.rate_review}.type_id AND ${tableConfig.rate_review}.approve_status=1 WHERE deal_value BETWEEN ${min} AND ${max} AND deal_status = 1`;

  console.log(name, " 000000000000000000");
  if (name !== "") {
    baseQuery = `${baseQuery} AND (deal_title REGEXP "${name}" OR deal_title_french REGEXP "${name}" )`;
  }
  if (firstLevelCategory && !isNaN(firstLevelCategory)) {
    baseQuery = `${baseQuery} AND category_id = ${Number(firstLevelCategory)}`;
  }
  if (secondLevelCategory && !isNaN(secondLevelCategory)) {
    baseQuery = `${baseQuery} AND sub_category_id = ${Number(
      secondLevelCategory
    )}`;
  }
  if (thirdLevelCategory && !isNaN(thirdLevelCategory)) {
    baseQuery = `${baseQuery} AND sec_category_id = ${Number(
      thirdLevelCategory
    )}`;
  }

  baseQuery = `${baseQuery} GROUP BY deal_id`;

  if (rate_review && rate_review.length > 0) {
    let reviews = rate_review.split(",");
    reviews.forEach((review, index) => {
      if (!isNaN(review) && index == 0) {
        if (reviews.length <= 1) {
          baseQuery = `${baseQuery} HAVING ratings = ${Number(review)}`;
        } else {
          baseQuery = `${baseQuery} HAVING ratings = ${Number(review)} OR`;
        }
      } else if (!isNaN(review) && index == reviews.length - 1) {
        baseQuery = `${baseQuery} ratings = ${Number(review)}`;
      } else if (!isNaN(review)) {
        baseQuery = `${baseQuery} ratings = ${Number(review)} OR`;
      }
    });
  } else {
    baseQuery = `${baseQuery} HAVING ratings IS NULL OR ratings >= 0`;
  }

  if (sort_by !== "") {
    switch (sort_by) {
      case "newest": {
        baseQuery = `${baseQuery} ORDER BY deal_id DESC`;
        break;
      }
      case "oldest": {
        baseQuery = `${baseQuery} ORDER BY deal_id ASC`;
        break;
      }
      case "mintomax": {
        baseQuery = `${baseQuery} ORDER BY deal_value ASC`;
        break;
      }
      case "maxtomin": {
        baseQuery = `${baseQuery} ORDER BY deal_value DESC`;
        break;
      }
    }
  }

  baseQuery = `${baseQuery} LIMIT ${
    isNaN(pageSize) ? 0 : Number(pageSize)
  } OFFSET ${
    isNaN(pageNumber * pageSize)
      ? 0
      : Number(pageNumber) === 1
      ? 0
      : Number((pageNumber - 1) * pageSize)
  }`;

  console.log(baseQuery);

  let products = await global?.SEQUELIZE?.query(baseQuery, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });

  return products;
};

exports.getMinMaxPrice = async () => {
  let productMinMaxPrice = await getValueFromRedis("productMinMaxPrice");
  if (productMinMaxPrice) {
    let parsedResponse = parseData(productMinMaxPrice);
    if (parsedResponse?.status) return parsedResponse?.data;
  }

  let query = `SELECT MAX(deal_value) as maximunPrice, MIN(deal_value) as minimumPrice FROM ${tableConfig.product} WHERE deal_status = 1;`;
  productMinMaxPrice = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });

  let stringifyResponse = stringifyData(productMinMaxPrice);
  if (stringifyResponse?.status) {
    await setValueRedis("productMinMaxPrice", stringifyResponse.data, 3600);
  }

  return productMinMaxPrice;
};

exports.getCategoryWiseProductCount = async () => {
  let categoryWiseProductCount = await getValueFromRedis(
    "categoryWiseProductCount"
  );

  if (categoryWiseProductCount) {
    let parsedResponse = parseData(categoryWiseProductCount);
    if (parsedResponse?.status) return parsedResponse?.data;
  }

  let query = `SELECT 
  COALESCE(COUNT(product.deal_id), 0) as total_products, 
  category.category_id,
  category.category_name, 
  category.category_name_french
FROM ${tableConfig.category} AS category
LEFT JOIN ${tableConfig.product} AS product 
ON product.category_id = category.category_id 
AND product.deal_status = 1 
GROUP BY category.category_id, category.category_name, category.category_name_french `;

  categoryWiseProductCount = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });

  let totalProducts = categoryWiseProductCount.reduce((total, category) => {
    return total + category.total_products;
  }, 0);

  categoryWiseProductCount.unshift({
    total_products: totalProducts,
    category_name: "ALL CATEGORY",
    category_name_french: "جميع الفئات",
    category_id: 1,
  });

  let stringifyResponse = stringifyData(categoryWiseProductCount);
  if (stringifyResponse?.status) {
    await setValueRedis(
      "categoryWiseProductCount",
      stringifyResponse.data,
      3600
    );
  }

  return categoryWiseProductCount;
};

exports.getProductDetail = async (deal_key) => {
  let query = `SELECT 
    ${tableConfig.product}.deal_title,
    ${tableConfig.product}.deal_title_french,
    ${tableConfig.product}.deal_id,
    ${tableConfig.product}.deal_description,
    ${tableConfig.product}.deal_description_french, 
    ${tableConfig.product}.deal_value, 
    ${tableConfig.product}.deal_price, 
    ${tableConfig.product}.delivery_period,
    ${tableConfig.product}.category_id,
    ${tableConfig.product}.sub_category_id,
    ${tableConfig.product}.sec_category_id,
    ${tableConfig.product}.related_products,
    ${tableConfig.product}.having_size_color,
    CASE WHEN ${tableConfig.product}.user_limit_quantity > 0 THEN true ELSE false END AS inStock,
    AVG(${tableConfig.rate_review}.rating) as ratings, 
    COUNT(${tableConfig.rate_review}.id) as total_reviews,
    main_category.category_name as main_category_name,
    sub_category.category_name as sub_category_name,
    second_level_category.category_name as second_level_category_name,
    main_category.category_name_french as main_category_name_french,
    sub_category.category_name_french as sub_category_name_french,
    second_level_category.category_name_french as second_level_category_name_french
  FROM ${tableConfig.product} 
  LEFT JOIN ${tableConfig.rate_review} ON ${tableConfig.rate_review}.type_id = ${tableConfig.product}.deal_id AND ${tableConfig.rate_review}.approve_status = 1
  LEFT JOIN ${tableConfig.category} AS main_category ON main_category.category_id = ${tableConfig.product}.category_id
  LEFT JOIN ${tableConfig.category} AS sub_category ON sub_category.category_id = ${tableConfig.product}.sub_category_id
  LEFT JOIN ${tableConfig.category} AS second_level_category ON second_level_category.category_id = ${tableConfig.product}.sec_category_id
  WHERE ${tableConfig.product}.deal_status = 1 AND ${tableConfig.product}.deal_key = "${deal_key}";`;

  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return response[0] ? response[0] : {};
};

exports.getRelatedProductsDetails = async (relatedProductIds, deal_id) => {
  relatedProductIds = relatedProductIds.join(",");
  let query = `SELECT deal_id, deal_title, deal_title_french,deal_key, deal_price, deal_value, CONCAT("${PRODUCT_DISPLAY_IMAGE}",deal_key,"_1.png") as image, CASE WHEN user_limit_quantity > 0 THEN true ELSE false END AS inStock, AVG(${tableConfig.rate_review}.rating) AS ratings FROM ${tableConfig.product} LEFT JOIN ${tableConfig.rate_review} ON ${tableConfig.product}.deal_id=${tableConfig.rate_review}.type_id AND ${tableConfig.rate_review}.approve_status=1 WHERE deal_status = 1 AND deal_id IN (${relatedProductIds}) AND deal_id != ${deal_id} GROUP BY deal_id;`;

  let relatedProducts = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return relatedProducts;
};

exports.getProductSizeDetails = async (productSizeDetails, productId) => {
  productSizeDetails = productSizeDetails.join(",");

  // let query = `SELECT size_name, size_id FROM ${tableConfig.size} WHERE size_id IN (${productSizeDetails});`;
  let query = `SELECT 
    size_name, 
    ${tableConfig.size}.size_id,
    sub_product.quantity,
    sub_product.price,
    sub_product.discount
  FROM ${tableConfig.size} 
  LEFT JOIN ( SELECT size_id, product_id, quantity, price, discount from ${tableConfig.sub_products} WHERE ${tableConfig.sub_products}.product_id = ${productId} ) as sub_product
  ON sub_product.size_id = size.size_id
  WHERE size.size_id IN (${productSizeDetails})
  GROUP BY sub_product.size_id;`;

  let relatedProducts = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return relatedProducts;
};

exports.getRandomProducts = async (
  categoryId,
  subcategoryId,
  secondSubCategory,
  deal_id
) => {
  let condition = "";
  if (categoryId !== "") {
    condition = `category_id = ${categoryId}`;
  }

  if (subcategoryId !== "") {
    if (condition !== "") {
      condition += " OR ";
    }
    condition = `sub_category_id = ${subcategoryId}`;
  }

  if (secondSubCategory !== "") {
    if (condition !== "") {
      condition += " OR ";
    }
    condition = `sec_category_id = ${secondSubCategory}`;
  }

  let query = `SELECT deal_id, deal_title, deal_title_french, deal_key, deal_price, deal_value, CONCAT("${PRODUCT_DISPLAY_IMAGE}",deal_key,"_1.png") as image, CASE WHEN user_limit_quantity > 0 THEN true ELSE false END AS inStock, AVG(${tableConfig.rate_review}.rating) AS ratings FROM ${tableConfig.product} LEFT JOIN ${tableConfig.rate_review} ON ${tableConfig.product}.deal_id=${tableConfig.rate_review}.type_id AND ${tableConfig.rate_review}.approve_status=1 WHERE deal_status = 1 AND ${condition} AND deal_id != ${deal_id} GROUP BY deal_id; ORDER BY RAND() LIMIT 5`;

  let randomRelatedProducts = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });

  return randomRelatedProducts;
};

exports.getProductInCartDetails = async (productId) => {
  let query = `SELECT count(item_id) as in_cart FROM ${tableConfig.cart_items} JOIN ${tableConfig.cart} ON ${tableConfig.cart_items}.cart_id = ${tableConfig.cart}.cart_id WHERE ${tableConfig.cart}.cart_transaction_status != 1 AND ${tableConfig.cart_items}.deal_id = ${productId};`;
  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return response && response[0] && response[0]?.in_cart
    ? response[0]?.in_cart
    : 0;
};

exports.getSubProductSizeAndQuantity = async (productId) => {
  let query = `SELECT 
    size_name,
    ${tableConfig.sub_products}.size_id, 
    ${tableConfig.sub_products}.quantity,
    ${tableConfig.sub_products}.price,
    ${tableConfig.sub_products}.discount,
    CASE WHEN quantity > 0 THEN true ELSE false END AS inStock
  FROM ${tableConfig.sub_products} 
  JOIN ${tableConfig.size} ON ${tableConfig.sub_products}.size_id = ${tableConfig.size}.size_id
  WHERE product_id = ${productId} ORDER BY size_name ASC;`;
  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return response;
};

exports.getOffersProducts = async ({
  rate_review = "",
  name = "",
  min = 0,
  max = 20000,
  pageNumber = 0,
  pageSize = 20,
  m_c: firstLevelCategory = 0,
  s_c: secondLevelCategory = 0,
  sl_c: thirdLevelCategory = 0,
  sort_by = "",
}) => {
  if (min == "" || isNaN(min)) {
    min = 0;
  }

  if (max == "" || isNaN(max)) {
    max = 20000;
  }

  if (pageNumber == "" || isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  if (pageSize == "" || isNaN(pageSize)) {
    pageSize = 20;
  }

  let baseQuery = `SELECT deal_id, having_size_color, deal_title, deal_title_french, deal_key, deal_price, deal_value, CONCAT("${PRODUCT_DISPLAY_IMAGE}", deal_key, "_1.png") as image, CASE WHEN user_limit_quantity > 0 THEN true ELSE false END AS inStock, AVG(${tableConfig.rate_review}.rating) AS ratings FROM ${tableConfig.product} LEFT JOIN ${tableConfig.rate_review} ON ${tableConfig.product}.deal_id=${tableConfig.rate_review}.type_id AND ${tableConfig.rate_review}.approve_status=1 WHERE deal_value BETWEEN ${min} AND ${max} AND deal_status = 1 AND category_id = 720`;

  if (name !== "") {
    baseQuery = `${baseQuery} AND deal_title REGEXP "${name}"`;
  }

  if (firstLevelCategory && !isNaN(firstLevelCategory)) {
    baseQuery = `${baseQuery} AND category_id = ${Number(firstLevelCategory)}`;
  }
  if (secondLevelCategory && !isNaN(secondLevelCategory)) {
    baseQuery = `${baseQuery} AND sub_category_id = ${Number(
      secondLevelCategory
    )}`;
  }
  if (thirdLevelCategory && !isNaN(thirdLevelCategory)) {
    baseQuery = `${baseQuery} AND sec_category_id = ${Number(
      thirdLevelCategory
    )}`;
  }

  baseQuery = `${baseQuery} GROUP BY deal_id`;

  if (rate_review && rate_review.length > 0) {
    let reviews = rate_review.split(",");
    reviews.forEach((review, index) => {
      if (!isNaN(review) && index == 0) {
        if (reviews.length <= 1) {
          baseQuery = `${baseQuery} HAVING ratings = ${Number(review)}`;
        } else {
          baseQuery = `${baseQuery} HAVING ratings = ${Number(review)} OR`;
        }
      } else if (!isNaN(review) && index == reviews.length - 1) {
        baseQuery = `${baseQuery} ratings = ${Number(review)}`;
      } else if (!isNaN(review)) {
        baseQuery = `${baseQuery} ratings = ${Number(review)} OR`;
      }
    });
  } else {
    baseQuery = `${baseQuery} HAVING ratings IS NULL OR ratings >= 0`;
  }

  if (sort_by !== "") {
    switch (sort_by) {
      case "newest": {
        baseQuery = `${baseQuery} ORDER BY deal_id DESC`;
        break;
      }
      case "oldest": {
        baseQuery = `${baseQuery} ORDER BY deal_id ASC`;
        break;
      }
      case "mintomax": {
        baseQuery = `${baseQuery} ORDER BY deal_value ASC`;
        break;
      }
      case "maxtomin": {
        baseQuery = `${baseQuery} ORDER BY deal_value DESC`;
        break;
      }
    }
  }

  const offset = (pageNumber - 1) * pageSize;
  baseQuery = `${baseQuery} LIMIT ${Number(pageSize)} OFFSET ${offset}`;

  let products = await global?.SEQUELIZE?.query(baseQuery, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return products;
};
