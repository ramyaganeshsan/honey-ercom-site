const { users } = require("../models");
const {
  generateRandomString,
  getCurrentTime,
  serializeData,
  deserializeData,
  updateSessionDetails,
  getUserSessionDetails,
} = require("../utils");
const { addToCart } = require("./cart.services");
const { getUserWishListItems } = require("./wishlist.services");
const md5 = require("md5");
const tableConfig = require("../database/table.config.json");
console.log("getUserSessionDetails initially: ", getUserSessionDetails);

exports.getUserLoginDetails = async ({ email, password }) => {
  let filters = {
    where: {
      email: email,
      password: md5(password),
      user_type: 4,
    },
    attributes: [
      "user_id",
      "firstname",
      "lastname",
      "email",
      "phone_number",
      "user_status",
    ],
    raw: true,
  };
  const userDetails = await users.findOne(filters);
  return userDetails;
};

exports.getUserGoogleLoginDetails = async ({ email, password }) => {
  let filters = {
    where: {
      email: email,
    },
    attributes: [
      "user_id",
      "firstname",
      "lastname",
      "email",
      "phone_number",
      "user_status",
    ],
    raw: true,
  };
  const userDetails = await users.findOne(filters);
  return userDetails;
};

exports.createUser = async (userDetails) => {
  userDetails["password"] = md5(userDetails["password"]);
  userDetails["city_id"] = 132;
  userDetails["state_id"] = 22;
  userDetails["country_id"] = 254;
  userDetails["referral_id"] = generateRandomString(8);
  userDetails["referred_user_id"] = 0;
  userDetails["joined_date"] = userDetails["gender"] = 1; // 1 -> Male, 2 -> Female
  userDetails["joined_date"] = getCurrentTime().unix();
  userDetails["last_login"] = getCurrentTime().unix();
  userDetails["user_type"] = 4;
  userDetails["user_status"] = 1;
  userDetails["approve_status"] = 1;
  userDetails["refference_key"] = getCurrentTime().unix();
  userDetails = {
    ...userDetails,
    firstname_french: "",
    lastname_french: "",
    fb_session_key: "",
    fb_user_id: "",
    twitter_id: "",
    twitter_access_token: "",
    // Numeric columns must be 0 (not "") — MySQL 8 rejects '' for INT/DOUBLE
    twitter_secret_token: 0,
    address1: "",
    address2: "",
    dob: "",
    my_favouites: "",
    payment_account_id: "",
    user_referral_balance: 0,
    merchant_account_balance: 0,
    merchant_commission: 0,
    deal_bought_count: 0,
    created_by: 0,
    login_type: 0,
    facebook_update: 0,
    wishlist: "",
    ship_name: "",
    ship_address1: "",
    ship_address2: "",
    ship_state: "",
    ship_country: 0,
    ship_city: 0,
    ship_mobileno: "",
    ship_zipcode: 0,
    AccountCountryCode: "",
    AccountEntity: "",
    AccountNumber: "",
    AccountPin: "",
    UserName: "",
    ShippingPassword: "",
    flat_amount: 0,
    change_password_must: 0,
    gplus_id: "",
    gplus_access_token: "",
    about_us: "",
    fbid: "",
    login_count: 0,
    lang: 0,
    is_guest: 0,
    user_reg_type: 0,
  };
  delete userDetails["confirm_password"];

  let response = await users.create(userDetails);
  if (response) {
    return response;
  }
  return null;
};

exports.moveWishlistAndCartProductsFromSession = async (
  sessionID,
  userDetails,
  fromLogin = false
) => {
  let cartDetails = null;
  let wishlist = null;
  if (sessionID && sessionID !== "") {
    console.log("sessionID : ", sessionID);
    console.log("calling one of auth service");
    console.log("getUserSessionDetails: ", getUserSessionDetails);
    console.log("updateSessionDetails : ", updateSessionDetails);

    let sessionWishlistAndCart = await getUserSessionDetails(sessionID);
    console.log("calling one of auth service");

    if (
      sessionWishlistAndCart &&
      sessionWishlistAndCart.length > 0 &&
      !sessionWishlistAndCart[0]["isMovedToUsers"]
    ) {
      wishlist = sessionWishlistAndCart[0]["wishlist"];
      if (fromLogin && wishlist && wishlist !== "") {
        let userWishlist = await getUserWishListItems(userDetails.user_id);
        if (!userWishlist || userWishlist === "") {
          wishlist = sessionWishlistAndCart[0]["wishlist"];
        } else {
          let updatedWishList = [];
          let sessionWishlist = [];
          if (userWishlist) {
            let deserializedWishList = deserializeData(userWishlist);
            if (Array.isArray(deserializedWishList)) {
              updatedWishList = deserializedWishList;
            }
          }
          if (sessionWishlist) {
            let deserializedWishList = deserializeData(wishlist);
            if (Array.isArray(deserializedWishList)) {
              sessionWishlist = deserializedWishList;
            }
          }

          wishlist = [...updatedWishList, ...sessionWishlist];
          wishlist = [...new Set(wishlist)];
          wishlist = serializeData(wishlist);
        }
      }

      if (
        sessionWishlistAndCart[0]["cart"] &&
        sessionWishlistAndCart[0]["cart"] !== ""
      ) {
        let deserializedCartDetails = deserializeData(
          sessionWishlistAndCart[0]["cart"]
        );
        if (Array.isArray(deserializedCartDetails)) {
          cartDetails = deserializedCartDetails;
        }
      }
      if (cartDetails && cartDetails?.length > 0) {
        /* Insert cart details into cart_items collection */
        for (let i = 0; i < cartDetails.length; i++) {
          await addToCart(cartDetails[i], userDetails, true);
        }
      }
      if (wishlist && wishlist !== "") {
        let query = `UPDATE ${
          tableConfig.users
        } SET wishlist="${wishlist}" WHERE user_id = ${Number(
          userDetails.user_id
        )}`;
        await global?.SEQUELIZE?.query(query);
      }
      await updateSessionDetails(sessionID);
    }
  }
};
