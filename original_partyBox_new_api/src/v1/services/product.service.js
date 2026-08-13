const {
  getValueFromRedis,
  stringifyData,
  setValueRedis,
  parseData,
} = require("../utils");
const { PRODUCT_DISPLAY_IMAGE } = require("../utils/constants");
const { findOne, findAll, count, aggregate } = require("../mongo/repo");

const APPROVED_STATUS = { $in: [1, true] };

function parsePageParams({ min, max, pageNumber, pageSize }) {
  let parsedMin = min;
  let parsedMax = max;
  let parsedPageNumber = pageNumber;
  let parsedPageSize = pageSize;

  if (parsedMin == "" || isNaN(parsedMin)) {
    parsedMin = 0;
  }
  if (parsedMax == "" || isNaN(parsedMax)) {
    parsedMax = 20000;
  }
  if (parsedPageNumber == "" || isNaN(parsedPageNumber)) {
    parsedPageNumber = 0;
  }
  if (parsedPageSize == "" || isNaN(parsedPageSize)) {
    parsedPageSize = 20;
  }

  return {
    min: Number(parsedMin),
    max: Number(parsedMax),
    pageNumber: Number(parsedPageNumber),
    pageSize: Number(parsedPageSize),
  };
}

function buildSort(sort_by) {
  switch (sort_by) {
    case "newest":
      return { deal_id: -1 };
    case "oldest":
      return { deal_id: 1 };
    case "mintomax":
      return { deal_value: 1 };
    case "maxtomin":
      return { deal_value: -1 };
    default:
      return null;
  }
}

function parseRatingFilter(rate_review) {
  if (!rate_review || !rate_review.length) return null;
  return rate_review
    .split(",")
    .map((review) => Number(review))
    .filter((review) => !isNaN(review));
}

async function queryProductsWithRatings({
  match,
  name = "",
  nameFields = ["deal_title", "deal_title_french"],
  rate_review = "",
  sort_by = "",
  pageNumber = 0,
  pageSize = 20,
  offsetOverride = null,
}) {
  const filter = { ...match };

  if (name !== "") {
    const regex = { $regex: name, $options: "i" };
    if (nameFields.length === 1) {
      filter[nameFields[0]] = regex;
    } else {
      filter.$or = nameFields.map((field) => ({ [field]: regex }));
    }
  }

  const ratingValues = parseRatingFilter(rate_review);
  const sort = buildSort(sort_by);
  const skip =
    offsetOverride != null
      ? offsetOverride
      : isNaN(pageNumber * pageSize)
      ? 0
      : Number(pageNumber) === 1
      ? 0
      : Number((pageNumber - 1) * pageSize);
  const limit = isNaN(pageSize) ? 0 : Number(pageSize);

  const pipeline = [
    { $match: filter },
    {
      $lookup: {
        from: "rate_review",
        let: { dealId: "$deal_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$type_id", "$$dealId"] },
                  { $in: ["$approve_status", [1, true]] },
                ],
              },
            },
          },
        ],
        as: "reviews",
      },
    },
    {
      $addFields: {
        ratings: { $avg: "$reviews.rating" },
        inStock: { $gt: ["$user_limit_quantity", 0] },
        image: {
          $concat: [PRODUCT_DISPLAY_IMAGE, "$deal_key", "_1.png"],
        },
      },
    },
  ];

  if (ratingValues && ratingValues.length > 0) {
    pipeline.push({ $match: { ratings: { $in: ratingValues } } });
  } else {
    pipeline.push({
      $match: {
        $or: [{ ratings: null }, { ratings: { $gte: 0 } }],
      },
    });
  }

  if (sort) {
    pipeline.push({ $sort: sort });
  }

  pipeline.push(
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        deal_id: 1,
        having_size_color: 1,
        deal_title: 1,
        deal_title_french: 1,
        deal_key: 1,
        deal_price: 1,
        deal_value: 1,
        image: 1,
        inStock: 1,
        ratings: 1,
      },
    }
  );

  return aggregate("product", pipeline);
}

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
  const parsed = parsePageParams({ min, max, pageNumber, pageSize });
  min = parsed.min;
  max = parsed.max;
  pageNumber = parsed.pageNumber;
  pageSize = parsed.pageSize;

  console.log(name, " 000000000000000000");

  const match = {
    deal_status: 1,
    deal_value: { $gte: min, $lte: max },
  };

  if (firstLevelCategory && !isNaN(firstLevelCategory)) {
    match.category_id = Number(firstLevelCategory);
  }
  if (secondLevelCategory && !isNaN(secondLevelCategory)) {
    match.sub_category_id = Number(secondLevelCategory);
  }
  if (thirdLevelCategory && !isNaN(thirdLevelCategory)) {
    match.sec_category_id = Number(thirdLevelCategory);
  }

  const products = await queryProductsWithRatings({
    match,
    name,
    nameFields: ["deal_title", "deal_title_french"],
    rate_review,
    sort_by,
    pageNumber,
    pageSize,
  });

  return products;
};

exports.getMinMaxPrice = async () => {
  let productMinMaxPrice = await getValueFromRedis("productMinMaxPrice");
  if (productMinMaxPrice) {
    let parsedResponse = parseData(productMinMaxPrice);
    if (parsedResponse?.status) return parsedResponse?.data;
  }

  const rows = await aggregate("product", [
    { $match: { deal_status: 1 } },
    {
      $group: {
        _id: null,
        maximunPrice: { $max: "$deal_value" },
        minimumPrice: { $min: "$deal_value" },
      },
    },
    {
      $project: {
        _id: 0,
        maximunPrice: 1,
        minimumPrice: 1,
      },
    },
  ]);

  productMinMaxPrice =
    rows.length > 0
      ? rows
      : [{ maximunPrice: null, minimumPrice: null }];

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

  const categories = await findAll(
    "category",
    {},
    {
      attributes: ["category_id", "category_name", "category_name_french"],
    }
  );

  const counts = await aggregate("product", [
    { $match: { deal_status: 1 } },
    {
      $group: {
        _id: "$category_id",
        total_products: { $sum: 1 },
      },
    },
  ]);
  const countMap = Object.fromEntries(
    counts.map((row) => [row._id, row.total_products])
  );

  categoryWiseProductCount = categories.map((category) => ({
    total_products: countMap[category.category_id] || 0,
    category_id: category.category_id,
    category_name: category.category_name,
    category_name_french: category.category_name_french,
  }));

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
  const product = await findOne("product", {
    deal_status: 1,
    deal_key: String(deal_key),
  });

  if (!product) {
    return {};
  }

  const [ratingRows, main_category, sub_category, second_level_category] =
    await Promise.all([
      aggregate("rate_review", [
        {
          $match: {
            type_id: product.deal_id,
            approve_status: APPROVED_STATUS,
          },
        },
        {
          $group: {
            _id: null,
            ratings: { $avg: "$rating" },
            total_reviews: { $sum: 1 },
          },
        },
      ]),
      findOne(
        "category",
        { category_id: product.category_id },
        { attributes: ["category_name", "category_name_french"] }
      ),
      findOne(
        "category",
        { category_id: product.sub_category_id },
        { attributes: ["category_name", "category_name_french"] }
      ),
      findOne(
        "category",
        { category_id: product.sec_category_id },
        { attributes: ["category_name", "category_name_french"] }
      ),
    ]);

  const ratingStats = ratingRows[0] || {};

  return {
    deal_title: product.deal_title,
    deal_title_french: product.deal_title_french,
    deal_id: product.deal_id,
    deal_description: product.deal_description,
    deal_description_french: product.deal_description_french,
    deal_value: product.deal_value,
    deal_price: product.deal_price,
    delivery_period: product.delivery_period,
    category_id: product.category_id,
    sub_category_id: product.sub_category_id,
    sec_category_id: product.sec_category_id,
    related_products: product.related_products,
    having_size_color: product.having_size_color,
    inStock: Number(product.user_limit_quantity) > 0,
    ratings: ratingStats.ratings ?? null,
    total_reviews: ratingStats.total_reviews ?? 0,
    main_category_name: main_category?.category_name ?? null,
    sub_category_name: sub_category?.category_name ?? null,
    second_level_category_name: second_level_category?.category_name ?? null,
    main_category_name_french: main_category?.category_name_french ?? null,
    sub_category_name_french: sub_category?.category_name_french ?? null,
    second_level_category_name_french:
      second_level_category?.category_name_french ?? null,
  };
};

exports.getRelatedProductsDetails = async (relatedProductIds, deal_id) => {
  if (!Array.isArray(relatedProductIds) || relatedProductIds.length === 0) {
    return [];
  }

  const ids = relatedProductIds
    .map((id) => Number(id))
    .filter((id) => !isNaN(id) && id !== Number(deal_id));

  if (!ids.length) {
    return [];
  }

  return queryProductsWithRatings({
    match: {
      deal_status: 1,
      deal_id: { $in: ids },
    },
    pageNumber: 1,
    pageSize: ids.length,
    offsetOverride: 0,
  });
};

exports.getProductSizeDetails = async (productSizeDetails, productId) => {
  if (!Array.isArray(productSizeDetails) || productSizeDetails.length === 0) {
    return [];
  }

  const sizeIds = productSizeDetails
    .map((id) => Number(id))
    .filter((id) => !isNaN(id));

  if (!sizeIds.length) {
    return [];
  }

  const [sizes, subProducts] = await Promise.all([
    findAll(
      "size",
      { size_id: { $in: sizeIds } },
      { attributes: ["size_name", "size_id"] }
    ),
    findAll(
      "sub_products",
      { product_id: Number(productId), size_id: { $in: sizeIds } },
      { attributes: ["size_id", "quantity", "price", "discount"] }
    ),
  ]);

  const subBySize = {};
  for (const sub of subProducts) {
    // GROUP BY size_id — keep first occurrence
    if (subBySize[sub.size_id] == null) {
      subBySize[sub.size_id] = sub;
    }
  }

  return sizes.map((size) => {
    const sub = subBySize[size.size_id];
    return {
      size_name: size.size_name,
      size_id: size.size_id,
      quantity: sub?.quantity ?? null,
      price: sub?.price ?? null,
      discount: sub?.discount ?? null,
    };
  });
};

exports.getRandomProducts = async (
  categoryId,
  subcategoryId,
  secondSubCategory,
  deal_id
) => {
  const orConditions = [];
  if (categoryId !== "" && categoryId != null) {
    orConditions.push({ category_id: Number(categoryId) });
  }
  if (subcategoryId !== "" && subcategoryId != null) {
    orConditions.push({ sub_category_id: Number(subcategoryId) });
  }
  if (secondSubCategory !== "" && secondSubCategory != null) {
    orConditions.push({ sec_category_id: Number(secondSubCategory) });
  }

  if (!orConditions.length) {
    return [];
  }

  const match = {
    deal_status: 1,
    deal_id: { $ne: Number(deal_id) },
    $or: orConditions,
  };

  const pipeline = [
    { $match: match },
    { $sample: { size: 5 } },
    {
      $lookup: {
        from: "rate_review",
        let: { dealId: "$deal_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$type_id", "$$dealId"] },
                  { $in: ["$approve_status", [1, true]] },
                ],
              },
            },
          },
        ],
        as: "reviews",
      },
    },
    {
      $addFields: {
        ratings: { $avg: "$reviews.rating" },
        inStock: { $gt: ["$user_limit_quantity", 0] },
        image: {
          $concat: [PRODUCT_DISPLAY_IMAGE, "$deal_key", "_1.png"],
        },
      },
    },
    {
      $project: {
        _id: 0,
        deal_id: 1,
        deal_title: 1,
        deal_title_french: 1,
        deal_key: 1,
        deal_price: 1,
        deal_value: 1,
        image: 1,
        inStock: 1,
        ratings: 1,
      },
    },
  ];

  return aggregate("product", pipeline);
};

exports.getProductInCartDetails = async (productId) => {
  const activeCarts = await findAll(
    "cart",
    { cart_transaction_status: { $ne: 1 } },
    { attributes: ["cart_id"] }
  );
  const cartIds = activeCarts.map((cart) => cart.cart_id);
  if (!cartIds.length) {
    return 0;
  }

  const inCart = await count("cart_items", {
    cart_id: { $in: cartIds },
    deal_id: Number(productId),
  });

  return inCart || 0;
};

exports.getSubProductSizeAndQuantity = async (productId) => {
  const subProducts = await findAll(
    "sub_products",
    { product_id: Number(productId) },
    {
      attributes: ["size_id", "quantity", "price", "discount"],
    }
  );

  if (!subProducts.length) {
    return [];
  }

  const sizeIds = [...new Set(subProducts.map((s) => s.size_id))];
  const sizes = await findAll(
    "size",
    { size_id: { $in: sizeIds } },
    { attributes: ["size_id", "size_name"] }
  );
  const sizeMap = Object.fromEntries(
    sizes.map((size) => [size.size_id, size.size_name])
  );

  const response = subProducts
    .filter((sub) => sizeMap[sub.size_id] != null)
    .map((sub) => ({
      size_name: sizeMap[sub.size_id],
      size_id: sub.size_id,
      quantity: sub.quantity,
      price: sub.price,
      discount: sub.discount,
      inStock: Number(sub.quantity) > 0,
    }));

  response.sort((a, b) =>
    String(a.size_name).localeCompare(String(b.size_name))
  );

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

  // SQL always constrains category_id = 720, then may AND another category_id
  if (
    firstLevelCategory &&
    !isNaN(firstLevelCategory) &&
    Number(firstLevelCategory) !== 720
  ) {
    return [];
  }

  const match = {
    deal_status: 1,
    category_id: 720,
    deal_value: { $gte: Number(min), $lte: Number(max) },
  };

  if (secondLevelCategory && !isNaN(secondLevelCategory)) {
    match.sub_category_id = Number(secondLevelCategory);
  }
  if (thirdLevelCategory && !isNaN(thirdLevelCategory)) {
    match.sec_category_id = Number(thirdLevelCategory);
  }

  const offset = (Number(pageNumber) - 1) * Number(pageSize);

  return queryProductsWithRatings({
    match,
    name,
    nameFields: ["deal_title"],
    rate_review,
    sort_by,
    pageNumber: Number(pageNumber),
    pageSize: Number(pageSize),
    offsetOverride: offset,
  });
};
