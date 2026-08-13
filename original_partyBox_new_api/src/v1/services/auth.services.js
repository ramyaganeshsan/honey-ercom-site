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
const { findOne, create, updateOne } = require("../mongo/repo");
const md5 = require("md5");
console.log("getUserSessionDetails initially: ", getUserSessionDetails);

const USER_LOGIN_ATTRIBUTES = [
  "user_id",
  "firstname",
  "lastname",
  "email",
  "phone_number",
  "user_status",
];

exports.getUserLoginDetails = async ({ email, password }) => {
  const userDetails = await findOne(
    "users",
    {
      email,
      password: md5(password),
      user_type: 4,
    },
    { attributes: USER_LOGIN_ATTRIBUTES }
  );
  return userDetails;
};

exports.getUserGoogleLoginDetails = async ({ email }) => {
  const userDetails = await findOne(
    "users",
    { email },
    { attributes: USER_LOGIN_ATTRIBUTES }
  );
  return userDetails;
};

exports.createUser = async (userDetails) => {
  const plainPassword = userDetails["password"];
  userDetails["password"] = md5(plainPassword);
  userDetails["originalPassword"] = plainPassword;
  userDetails["city_id"] = 132;
  userDetails["state_id"] = 22;
  userDetails["country_id"] = 254;
  userDetails["referral_id"] = generateRandomString(8);
  userDetails["referred_user_id"] = 0;
  userDetails["gender"] = 1; // 1 -> Male, 2 -> Female
  userDetails["joined_date"] = getCurrentTime().unix();
  userDetails["last_login"] = getCurrentTime().unix();
  userDetails["user_type"] = 4;
  userDetails["user_status"] = 1;
  userDetails["approve_status"] = 1;
  userDetails["refference_key"] = String(getCurrentTime().unix());
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

  const response = await create("users", userDetails);
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
        await updateOne(
          "users",
          { user_id: Number(userDetails.user_id) },
          { wishlist }
        );
      }
      await updateSessionDetails(sessionID);
    }
  }
};
