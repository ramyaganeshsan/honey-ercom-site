const {
  getStatusCode,
  deserializeData,
  isValidUserDetails,
} = require("../utils");
const logger = require("../utils/logger");

const {
  getBannerImage,
  getCategories,
  getProducts,
  getBestSellingProducts,
  getOfferProducts,
  getUserCartProductCount,
  getUserWishListCount,
  getUserCartAndWishlistCountSession,
} = require("../services/home.services");

const { getSiteInfo } = require("../services/common.services");
const { getDummyHomeData } = require("../utils/dummyHomeData");

const isEmptyList = (value) => !Array.isArray(value) || value.length === 0;

exports.getHomePageContents = async (req, res, next) => {
  try {
    const { userDetails } = req;
    const sessionID = req.userSessionID;

    let promises = [
      getBannerImage(),
      getProducts(),
      getBestSellingProducts(),
      getOfferProducts(),
      getCategories(),
      getSiteInfo(),
    ];

    let userCartDetails = { wishListCount: 0, cartCount: 0, wishList: [] };
    if (userDetails && userDetails?.user_id) {
      promises.push(
        getUserCartProductCount(userDetails?.user_id),
        getUserWishListCount(userDetails?.user_id)
      );
    } else if (sessionID && !isValidUserDetails(userDetails)) {
      promises.push(getUserCartAndWishlistCountSession(sessionID));
    }

    let [
      bannerImages,
      newProducts,
      bestSellingProducts,
      offerProducts,
      categories,
      siteSettings,
      totalCartCount,
      userWishList,
    ] = await Promise.all(promises);

    // Local/demo fallback when DB has no catalog content yet
    const useDummy =
      process.env.USE_DUMMY_DATA === "true" ||
      process.env.NODE_ENV === "development" ||
      process.env.USE_DUMMY_DATA === "1";

    if (
      useDummy &&
      (isEmptyList(bannerImages) ||
        isEmptyList(newProducts) ||
        isEmptyList(bestSellingProducts) ||
        isEmptyList(offerProducts) ||
        isEmptyList(categories))
    ) {
      const dummy = getDummyHomeData();
      if (isEmptyList(bannerImages)) bannerImages = dummy.bannerImages;
      if (isEmptyList(newProducts)) newProducts = dummy.newProducts;
      if (isEmptyList(bestSellingProducts)) {
        bestSellingProducts = dummy.bestSellingProducts;
      }
      if (isEmptyList(offerProducts)) offerProducts = dummy.offerProducts;
      if (isEmptyList(categories)) categories = dummy.categories;
    }

    if (userDetails && userDetails?.user_id) {
      let totalWishlistCount = 0;
      let deserializedData = {};
      if (userWishList && userWishList?.wishlist) {
        deserializedData = deserializeData(userWishList.wishlist);
        if (Array.isArray(deserializedData)) {
          totalWishlistCount = deserializedData.length;
        }
      }
      userCartDetails = {
        wishListCount: totalWishlistCount,
        cartCount: totalCartCount ?? 0,
        wishList: Array.isArray(deserializedData) ? deserializedData : [],
      };
    } else if (sessionID) {
      if (totalCartCount && totalCartCount.length > 0) {
        let cartCount = 0;

        if (totalCartCount[0]["cart"]) {
          let deserializedCartData = deserializeData(totalCartCount[0]["cart"]);
          if (Array.isArray(deserializedCartData)) {
            cartCount = deserializedCartData.length;
          }
        }

        let wishlistCount = 0;
        let wishlist = [];
        if (totalCartCount[0]["wishlist"]) {
          let deserializedWishlistData = deserializeData(
            totalCartCount[0]["wishlist"]
          );
          if (Array.isArray(deserializedWishlistData)) {
            wishlistCount = deserializedWishlistData.length;
            wishlist = deserializedWishlistData;
          }
        }

        userCartDetails = {
          wishListCount: wishlistCount,
          cartCount: cartCount ?? 0,
          wishList: Array.isArray(wishlist) ? wishlist : [],
        };
      }
    }

    res.send({
      status: getStatusCode("success"),
      data: {
        bannerImages,
        categories,
        newProducts,
        bestSellingProducts,
        offerProducts,
        userCartDetails,
        siteSettings,
      },
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};
