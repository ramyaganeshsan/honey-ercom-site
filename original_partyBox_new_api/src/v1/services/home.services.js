const {
  BANNER_IMAGE_URL,
  PRODUCT_DISPLAY_IMAGE,
} = require("../utils/constants");
const {
  getValueFromRedis,
  setValueRedis,
  stringifyData,
  parseData,
} = require("../utils");
const { findOne, findAll, aggregate } = require("../mongo/repo");

const APPROVED_STATUS = { $in: [1, true] };

async function attachProductListFields(products) {
  if (!products.length) return [];

  const dealIds = products.map((p) => p.deal_id);
  const ratingRows = await aggregate("rate_review", [
    {
      $match: {
        type_id: { $in: dealIds },
        approve_status: APPROVED_STATUS,
      },
    },
    {
      $group: {
        _id: "$type_id",
        ratings: { $avg: "$rating" },
      },
    },
  ]);
  const ratingMap = Object.fromEntries(
    ratingRows.map((row) => [row._id, row.ratings])
  );

  return products.map((p) => ({
    deal_id: p.deal_id,
    deal_title: p.deal_title,
    deal_title_french: p.deal_title_french,
    deal_key: p.deal_key,
    deal_price: p.deal_price,
    deal_value: p.deal_value,
    having_size_color: p.having_size_color,
    image: `${PRODUCT_DISPLAY_IMAGE}${p.deal_key}_1.png`,
    inStock: Number(p.user_limit_quantity) > 0,
    ratings: ratingMap[p.deal_id] ?? null,
  }));
}

exports.getBannerImage = async () => {
  let bannerImages = await getValueFromRedis("bannerImages");
  if (bannerImages) {
    let parsedResponse = parseData(bannerImages);
    if (parsedResponse?.status) return parsedResponse?.data;
  }

  const rows = await findAll(
    "banner_image",
    { status: 1, home: 1 },
    {
      attributes: ["banner_id", "image_title", "redirect_url"],
      order: [["banner_id", "DESC"]],
      limit: 5,
    }
  );

  const response = rows.map((row) => ({
    banner_id: row.banner_id,
    image_title: row.image_title,
    redirect_url: row.redirect_url,
    url: `${BANNER_IMAGE_URL}${row.banner_id}.png`,
  }));

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

  // Flat catalog: only top-level categories (no subcategory tree)
  const response = await findAll(
    "category",
    {
      category_status: 1,
      $or: [
        { main_category_id: 0 },
        { main_category_id: null },
        { main_category_id: { $exists: false } },
      ],
    },
    {
      attributes: [
        "category_id",
        "category_name",
        "category_name_french",
        "main_category_id",
        "sub_category_id",
      ],
      order: [["sort_order", "ASC"], ["category_id", "ASC"]],
    }
  );

  const categories = (Array.isArray(response) ? response : [])
    .filter((c) => !Number(c?.main_category_id))
    .map((c) => ({
      ...c,
      category: [],
    }));

  let stringifyResponse = stringifyData(categories);
  if (stringifyResponse?.status) {
    await setValueRedis("homeCategories", stringifyResponse.data, 300);
  }

  return categories;
};

exports.getProducts = async () => {
  let newProducts = await getValueFromRedis("newProducts");
  if (newProducts) {
    let parsedResponse = parseData(newProducts);
    if (parsedResponse?.status) return parsedResponse?.data;
  }

  const products = await findAll(
    "product",
    { deal_status: 1, category_id: { $ne: 720 } },
    {
      attributes: [
        "deal_id",
        "deal_title",
        "deal_title_french",
        "deal_key",
        "deal_price",
        "deal_value",
        "having_size_color",
        "user_limit_quantity",
      ],
      order: [["deal_id", "DESC"]],
      limit: 8,
    }
  );

  let response = await attachProductListFields(products);

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

  const products = await findAll(
    "product",
    { deal_status: 1 },
    {
      attributes: [
        "deal_id",
        "deal_title",
        "deal_title_french",
        "deal_key",
        "deal_price",
        "deal_value",
        "having_size_color",
        "user_limit_quantity",
        "purchase_count",
      ],
      order: [["purchase_count", "DESC"]],
      limit: 8,
    }
  );

  let response = await attachProductListFields(products);

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

  const products = await findAll(
    "product",
    { deal_status: 1, category_id: 720 },
    {
      attributes: [
        "deal_id",
        "deal_title",
        "deal_title_french",
        "deal_key",
        "deal_price",
        "deal_value",
        "having_size_color",
        "user_limit_quantity",
        "purchase_count",
      ],
      order: [["purchase_count", "DESC"]],
      limit: 8,
    }
  );

  let response = await attachProductListFields(products);

  let stringifyResponse = stringifyData(response);
  if (stringifyResponse?.status) {
    await setValueRedis("offerProducts", stringifyResponse.data, 120);
  }
  return response;
};

exports.getUserCartProductCount = async (userId) => {
  const response = await findOne(
    "cart",
    {
      user_id: Number(userId),
      cart_transaction_status: { $ne: 1 },
    },
    { attributes: ["total_cart_items"] }
  );
  return response?.total_cart_items ?? 0;
};

exports.getUserWishListCount = async (userId) => {
  const response = await findOne(
    "users",
    { user_id: Number(userId) },
    { attributes: ["wishlist"] }
  );
  return response;
};

exports.getUserCartAndWishlistCountSession = async (sessionID) => {
  const doc = await findOne(
    "sessions",
    { session_id: sessionID, isMovedToUsers: 0 },
    { attributes: ["wishlist", "cart"] }
  );
  return doc ? [doc] : [];
};
