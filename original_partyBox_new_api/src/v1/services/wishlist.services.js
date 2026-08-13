const {
  deserializeData,
  serializeData,
  checkProductIsActive,
} = require("../utils");
const { PRODUCT_LIST_DISPLAY_IMAGE } = require("../utils/constants");
const { findOne, findAll, updateOne, aggregate } = require("../mongo/repo");

const APPROVED_STATUS = { $in: [1, true] };

const getUserWishList = async (userId) => {
  const user = await findOne(
    "users",
    { user_id: Number(userId) },
    { attributes: ["wishlist"] }
  );
  return user?.wishlist ?? null;
};

const getUserWishListFromSession = async (sessionID) => {
  const session = await findOne(
    "sessions",
    { session_id: sessionID },
    { attributes: ["wishlist", "isMovedToUsers"] }
  );
  if (session?.isMovedToUsers) {
    return -2;
  }
  return session?.wishlist ?? null;
};

const updateSessionWishlist = async (serializedWishList, sessionID) => {
  await updateOne(
    "sessions",
    { session_id: sessionID },
    { wishlist: serializedWishList }
  );
};

exports.getWishList = async (userId, fromSession = false, sessionID = "") => {
  let wishList = "";

  if (fromSession) {
    wishList = await getUserWishListFromSession(sessionID);
    if (wishList === -2) {
      return -2;
    }
  } else {
    wishList = await getUserWishList(userId);
  }

  if (wishList) {
    let deserializedWishList = deserializeData(wishList);
    if (
      Array.isArray(deserializedWishList) &&
      deserializedWishList?.length > 0
    ) {
      const dealIds = deserializedWishList
        .map((id) => Number(id))
        .filter((id) => !isNaN(id));

      if (!dealIds.length) {
        return [];
      }

      const products = await findAll(
        "product",
        { deal_id: { $in: dealIds } },
        {
          attributes: [
            "deal_id",
            "deal_title",
            "deal_title_french",
            "deal_key",
            "deal_value",
            "deal_price",
            "having_size_color",
            "user_limit_quantity",
          ],
        }
      );

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
            total_reviews: { $sum: 1 },
          },
        },
      ]);
      const ratingMap = Object.fromEntries(
        ratingRows.map((row) => [
          row._id,
          { ratings: row.ratings, total_reviews: row.total_reviews },
        ])
      );

      return products.map((p) => ({
        deal_id: p.deal_id,
        deal_title: p.deal_title,
        deal_title_french: p.deal_title_french,
        deal_key: p.deal_key,
        deal_value: p.deal_value,
        deal_price: p.deal_price,
        having_size_color: p.having_size_color,
        image: `${PRODUCT_LIST_DISPLAY_IMAGE}${p.deal_key}_1.png`,
        inStock: Number(p.user_limit_quantity) > 0,
        ratings: ratingMap[p.deal_id]?.ratings ?? null,
        total_reviews: ratingMap[p.deal_id]?.total_reviews ?? 0,
      }));
    }
  }
  return [];
};

exports.addToWishList = async (
  userId,
  productId,
  fromSession = false,
  sessionID = ""
) => {
  let productDetails = await checkProductIsActive(productId);
  if (!productDetails) {
    return { status: 2 };
  }

  let wishList = "";

  if (fromSession) {
    wishList = await getUserWishListFromSession(sessionID);
    if (wishList === -2) {
      return -2;
    }
  } else {
    wishList = await getUserWishList(userId);
  }

  let updatedWishList = [];
  if (wishList) {
    let deserializedWishList = deserializeData(wishList);
    if (Array.isArray(deserializedWishList)) {
      updatedWishList = deserializedWishList;
    }
  }

  if (updatedWishList.includes(Number(productId))) {
    return { status: 1, totalWishlistedProducts: updatedWishList.length };
  }

  updatedWishList.push(Number(productId));
  let serializedWishList = serializeData(updatedWishList);

  if (!fromSession) {
    const updated = await updateOne(
      "users",
      { user_id: Number(userId) },
      { wishlist: serializedWishList }
    );

    return {
      status: updated ? 1 : 0,
      totalWishlistedProducts: updatedWishList.length,
    };
  }

  await updateSessionWishlist(serializedWishList, sessionID);
  return {
    status: 1,
    totalWishlistedProducts: updatedWishList.length,
  };
};

exports.removeFromWishList = async (
  userId,
  productId,
  fromSession = false,
  sessionID = ""
) => {
  let wishList = "";
  if (fromSession) {
    wishList = await getUserWishListFromSession(sessionID);
    if (wishList === -2) {
      return -2;
    }
  } else {
    wishList = await getUserWishList(userId);
  }

  let updatedWishList = [];
  if (wishList) {
    let deserializedWishList = deserializeData(wishList);
    if (Array.isArray(deserializedWishList)) {
      updatedWishList = deserializedWishList;
    }
  }

  if (!updatedWishList.includes(Number(productId))) {
    return { status: 2, totalWishListItems: 0 };
  }

  updatedWishList.splice(updatedWishList.indexOf(Number(productId)), 1);
  let serializedWishList = serializeData(updatedWishList);

  if (!fromSession) {
    const updated = await updateOne(
      "users",
      { user_id: Number(userId) },
      { wishlist: serializedWishList }
    );
    return {
      status: updated ? 1 : 0,
      totalWishListItems: updatedWishList?.length ?? 0,
    };
  }

  await updateSessionWishlist(serializedWishList, sessionID);
  return {
    status: 1,
    totalWishListItems: updatedWishList?.length ?? 0,
  };
};

exports.getUserWishListItems = async (userId) => {
  let response = await getUserWishList(userId);
  return response;
};
