const { users } = require("../models");
const tableConfig = require("../database/table.config.json");
const {
  deserializeData,
  serializeData,
  checkProductIsActive,
} = require("../utils");
const { PRODUCT_LIST_DISPLAY_IMAGE } = require("../utils/constants");

const getUserWishList = async (userId) => {
  let query = `SELECT wishlist FROM ${
    tableConfig.users
  } WHERE user_id = ${Number(userId)}`;
  let user = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return (user[0] && user[0]?.wishlist) ?? null;
};

const getUserWishListFromSession = async (sessionID) => {
  let query = `SELECT wishlist, isMovedToUsers FROM ${tableConfig.sessions} WHERE session_id = "${sessionID}"`;
  let user = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  if (user[0] && user[0]?.isMovedToUsers) {
    return -2;
  }
  return (user[0] && user[0]?.wishlist) ?? null;
};

const updateSessionWishlist = async (serializedWishList, sessionID) => {
  let query = `UPDATE ${tableConfig.sessions} SET wishlist = "${serializedWishList}" WHERE session_id = "${sessionID}"`;
  await global?.SEQUELIZE?.query(query);
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
      let query = `
      SELECT 
          deal_id,
          deal_title,
          deal_title_french,
          deal_key,
          deal_value,
          deal_price,
          having_size_color,
          CONCAT("${PRODUCT_LIST_DISPLAY_IMAGE}",deal_key,"_1.png") as image,
          CASE WHEN user_limit_quantity > 0 THEN true ELSE false END AS inStock,
          AVG(${tableConfig.rate_review}.rating) as ratings, 
          COUNT(${tableConfig.rate_review}.id) as total_reviews
      FROM ${tableConfig.product}
      LEFT JOIN ${tableConfig.rate_review} ON ${
        tableConfig.rate_review
      }.type_id = product.deal_id AND ${
        tableConfig.rate_review
      }.approve_status = 1
      WHERE deal_id IN (${deserializedWishList.join(",")})
      GROUP BY deal_id;`;

      let response = await global?.SEQUELIZE?.query(query, {
        type: global?.SEQUELIZE?.QueryTypes?.SELECT,
      });

      return response;
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
    let filter = {
      user_id: userId,
    };
    let response = await users.update(
      { wishlist: serializedWishList },
      { where: filter }
    );

    return {
      status: response[0] ?? 0,
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
    let filter = {
      user_id: userId,
    };

    let response = await users.update(
      { wishlist: serializedWishList },
      { where: filter }
    );
    return {
      status: response?.length ? 1 : 0,
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
