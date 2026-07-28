const logger = require("../utils/logger");
const {
  getWishList,
  addToWishList,
  removeFromWishList,
} = require("../services/wishlist.services");
const {
  getStatusCode,
  getMessage,
  isValidUserDetails,
  getUUID,
} = require("../utils/index");
const { createSessionUser } = require("../services/common.services");

exports.getWishList = async (req, res, next) => {
  try {
    let sessionID = req.userSessionID;
    let { userDetails } = req;

    if (!sessionID && !isValidUserDetails(userDetails)) {
      let response = {
        status: getStatusCode("success"),
        message: "",
        data: [],
      };
      return res.send(response);
    }

    if (sessionID && !isValidUserDetails(userDetails)) {
      let userWishListProducts = await getWishList(
        userDetails?.user_id,
        true,
        sessionID
      );

      let response = {
        status: getStatusCode("success"),
        message: "",
        data: userWishListProducts ?? [],
      };

      if (userWishListProducts === -2) {
        response["status"] = getStatusCode("session_expired");
        response["message"] = getMessage("session_expired", req.lang);
        response["data"] = [];
      }

      return res.send(response);
    }

    let userWishListProducts = await getWishList(userDetails?.user_id);

    let response = {
      status: getStatusCode("success"),
      message: "",
      data: userWishListProducts ?? [],
    };

    res.send(response);
  } catch (err) {
    logger.error(err);
    next(err);
  }
};

exports.addToWishList = async (req, res, next) => {
  try {
    let { body, userDetails } = req;
    let sessionID = req.userSessionID;

    let response = {
      status: getStatusCode("success"),
      message: getMessage("added_to_wishlist", req.lang),
      data: {
        totalWishlistedProducts: 0,
      },
      sessionID: sessionID,
    };

    if (!sessionID && !isValidUserDetails(userDetails)) {
      sessionID = getUUID();
      let insertID = await createSessionUser(sessionID);
      if (!insertID) {
        response["status"] = getStatusCode("failed");
        response["message"] = getMessage("try_again", req.lang);
        return res.send(response);
      }
      response["sessionID"] = sessionID;
    }

    /* responseStatus : 1 -> Success, 0 -> Failed, 2 -> Product not found */
    let wishlistResponse = {};
    if (sessionID && !isValidUserDetails(userDetails)) {
      wishlistResponse = await addToWishList(
        userDetails?.user_id,
        body?.productId,
        true,
        sessionID
      );

      if (wishlistResponse === -2) {
        response["status"] = getStatusCode("session_expired");
        response["message"] = getMessage("session_expired", req.lang);
        response["sessionID"] = "";
        return res.send(response);
      }
    } else {
      wishlistResponse = await addToWishList(
        userDetails?.user_id,
        body?.productId
      );
    }

    if (Number(wishlistResponse?.status) === 2) {
      response["status"] = getStatusCode("failed");
      response["message"] = getMessage("product_not_found", req.lang);
    }
    if (Number(wishlistResponse?.status) === 0) {
      response["status"] = getStatusCode("failed");
      response["message"] = getMessage("try_again", req.lang);
    }
    if (Number(wishlistResponse?.status) === 1) {
      response["data"]["totalWishlistedProducts"] =
        wishlistResponse?.totalWishlistedProducts;
    }

    res.send(response);
  } catch (err) {
    logger.error(err);
    next(err);
  }
};

exports.removeFromWishList = async (req, res, next) => {
  try {
    let { body, userDetails } = req;
    let sessionID = req.userSessionID;

    let response = {
      status: getStatusCode("success"),
      message: getMessage("removed_from_wishlist", req.lang),
      data: {
        totalWishListItems: 0,
      },
    };

    if (!sessionID && !isValidUserDetails(userDetails)) {
      response["status"] = getStatusCode("failed");
      response["message"] = getMessage("try_again", req.lang);
      return res.send(response);
    }

    /* responseStatus : 1 -> Success, 0 -> Failed, 2 -> Product not on wishlist */
    let responseStatus = "";
    if (sessionID && !isValidUserDetails(userDetails)) {
      responseStatus = await removeFromWishList(
        userDetails?.user_id,
        body?.productId,
        true,
        sessionID
      );
      if (responseStatus === -2) {
        response["status"] = getStatusCode("session_expired");
        response["message"] = getMessage("session_expired", req.lang);
        return res.send(response);
      }
    } else {
      responseStatus = await removeFromWishList(
        userDetails?.user_id,
        body?.productId
      );
    }

    if (Number(responseStatus.status) === 2) {
      response["status"] = getStatusCode("failed");
      response["message"] = getMessage("product_not_on_wishlist", req.lang);
    }
    if (Number(responseStatus) === 0) {
      response["status"] = getStatusCode("failed");
      response["message"] = getMessage("try_again", req.lang);
    }
    if (Number(responseStatus.status) === 1) {
      response["data"]["totalWishListItems"] =
        responseStatus?.totalWishListItems ?? 0;
    }
    res.send(response);
  } catch (err) {
    logger.error(err);
    next(err);
  }
};
