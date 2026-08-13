const {
  getValueFromRedis,
  setValueRedis,
  stringifyData,
  parseData,
  shopOpensAtTitle,
  shopOpensAtTime,
  shopOpensAtWeekendTitle,
  shopOpensAtWeekendTime,
  getCurrentTimestamp,
  generateRandomString,
  getCurrentTime,
  deserializeData,
  getUserSessionDetails,
  updateSessionDetails,
} = require("../utils");
const { PUBLIC_IMAGE_FOLDER } = require("../utils/constants");
const md5 = require("md5");
const { addToCart } = require("./cart.services");
const { count, findOne, findAll, create, updateOne } = require("../mongo/repo");

exports.checkUserEmailExists = async (email, id = "") => {
  const condition = { email };
  if (id && id != "") {
    condition.user_id = { $ne: parseInt(id, 10) };
  }
  return count("users", condition);
};

exports.checkUserPhoneNumberExists = async (phoneNumber, id = "") => {
  const condition = { phone_number: phoneNumber };
  if (id && id != "") {
    condition.user_id = { $ne: parseInt(id, 10) };
  }
  return count("users", condition);
};

const SITE_SETTINGS_ATTRIBUTES = [
  "phone1",
  "contact_email",
  "site_name",
  "title",
  "default_language",
  "address1",
  "address2",
  "zipcode",
  "country",
  "city",
  "facebook_page",
  "instagram_page",
  "twitter_page",
  "linkedin_page",
  "android_page",
  "iphone_page",
  "youtube_url",
  "currency_symbol",
  "currency_code",
  "time_zone",
  "pagination_count",
  "latitude",
  "longitude",
  "tax_percentage",
];

const OPTIONAL_SITE_SETTINGS_ATTRIBUTES = [
  "minimumProductQuantityToNotify",
  "adminEmailAddress",
  "sendOutOfStockNotification",
];

const DUMMY_SITE_SETTINGS = {
  phone1: "+0000000000",
  contact_email: "admin@example.com",
  site_name: "Honey Shop",
  title: "Honey Shop",
  default_language: "en",
  address1: "Demo Address",
  address2: "",
  zipcode: "00000",
  country: "SA",
  city: "Riyadh",
  facebook_page: "",
  instagram_page: "",
  twitter_page: "",
  linkedin_page: "",
  android_page: "",
  iphone_page: "",
  youtube_url: "",
  currency_symbol: "SAR",
  currency_code: "SAR",
  time_zone: "Asia/Riyadh",
  pagination_count: 12,
  latitude: "0",
  longitude: "0",
  tax_percentage: 15,
  minimumProductQuantityToNotify: 5,
  adminEmailAddress: "admin@example.com",
  sendOutOfStockNotification: false,
};

exports.getSiteInfo = async () => {
  let siteSettingsDetails = await getValueFromRedis("site_settings");
  if (siteSettingsDetails) {
    let parsedResponse = parseData(siteSettingsDetails);
    if (parsedResponse?.status) return parsedResponse?.data;
  }

  let response = await findOne("settings", {}, {
    attributes: [
      ...SITE_SETTINGS_ATTRIBUTES,
      ...OPTIONAL_SITE_SETTINGS_ATTRIBUTES,
    ],
  });

  if (!response) {
    response = { ...DUMMY_SITE_SETTINGS };
  }

  response.minimumProductQuantityToNotify =
    response.minimumProductQuantityToNotify ??
    DUMMY_SITE_SETTINGS.minimumProductQuantityToNotify;
  response.adminEmailAddress =
    response.adminEmailAddress ?? DUMMY_SITE_SETTINGS.adminEmailAddress;
  response.sendOutOfStockNotification =
    response.sendOutOfStockNotification ??
    DUMMY_SITE_SETTINGS.sendOutOfStockNotification;
  response.tax_percentage =
    response.tax_percentage ?? DUMMY_SITE_SETTINGS.tax_percentage;
  response.site_name = response.site_name || DUMMY_SITE_SETTINGS.site_name;
  response.title = response.title || DUMMY_SITE_SETTINGS.title;
  response.currency_symbol =
    response.currency_symbol || DUMMY_SITE_SETTINGS.currency_symbol;
  response.currency_code =
    response.currency_code || DUMMY_SITE_SETTINGS.currency_code;

  // let googleMapUrl = `http://maps.google.com/maps?q=${response?.latitude},${response?.longitude}`;
  let googleMapUrl =
    "https://www.google.com/maps/place/Manahel+althunayyan+%D9%85%D9%86%D8%A7%D8%AD%D9%84+%D8%A7%D9%84%D8%AB%D9%86%D9%8A%D8%A7%D9%86%E2%80%AD/@25.3101091,55.4582879,18z/data=!3m1!4b1!4m6!3m5!1s0x3e5f5fb050d50d2f:0xafbb2a7fe60f16ab!8m2!3d25.3101091!4d55.4595754!16s%2Fg%2F11k7v38dvr?entry=ttu";

  response["googleMapUrl"] = googleMapUrl;
  response["shopTitle1"] = shopOpensAtTitle;
  response["shopTiming1"] = shopOpensAtTime;
  response["shopTitle2"] = shopOpensAtWeekendTitle;
  response["shopTiming2"] = shopOpensAtWeekendTime;
  response["footer_logo"] = `${PUBLIC_IMAGE_FOLDER}footer-logo.svg`;
  response["copy_right"] = `Copyright © ${new Date().getFullYear()} ${
    response["site_name"]
  }. All rights reserved.`;
  response["pinterest"] = "https://www.pinterest.com/";
  response["offer_poster"] = `${PUBLIC_IMAGE_FOLDER}poster.png`;
  response["login_page_image"] = `${PUBLIC_IMAGE_FOLDER}login-image.png`;
  response["signin_page_image"] = `${PUBLIC_IMAGE_FOLDER}login-image.png`;
  response["offer_text"] = "UP TO 70 % OFF";
  response["payment_types"] = [
    { name: "online_payment", value: 1 },
    { name: "cash_on_delivery", value: 0 },
    // { name: "tabby", value: 2 },
    // { name: "pickup_from_store", value: 2 },
  ];

  let stringifyResponse = stringifyData(response);
  if (stringifyResponse?.status) {
    await setValueRedis("site_settings", stringifyResponse?.data, 900);
  }

  return response;
};

exports.getShippingStateCityInfo = async () => {
  let siteSettingsDetails = await getValueFromRedis("state_and_city_info");
  if (siteSettingsDetails) {
    let parsedResponse = parseData(siteSettingsDetails);
    if (parsedResponse?.status) return parsedResponse?.data;
  }

  const countries = await findAll(
    "country",
    { country_status: 1 },
    { attributes: ["country_name", "country_id", "country_code"] }
  );
  const cities = await findAll(
    "city",
    { city_status: 1 },
    {
      attributes: [
        "city_id",
        "country_id",
        "stateid",
        "city_name",
        "city_name_french",
        "delivery_charge",
      ],
    }
  );
  const states = await findAll(
    "state",
    { statestatus: 1 },
    { attributes: ["state_id", "state_name", "state_name_arabic", "state_country_id"] }
  );

  let response = (countries || []).map((c) => ({
    ...c,
    ISO_country_code: c?.ISO_country_code ?? c?.country_code ?? "",
    cities: (cities || []).filter((x) => Number(x.country_id) === Number(c.country_id)),
    states: (states || []).filter(
      (x) => Number(x.state_country_id) === Number(c.country_id)
    ),
  }));

  // Demo fallback so profile/checkout work before geo seed
  if (!response.length) {
    response = [
      {
        country_id: 254,
        country_name: "United Arab Emirates",
        country_code: "AE",
        ISO_country_code: "AE",
        states: [
          {
            state_id: 22,
            state_name: "Sharjah",
            state_name_arabic: "الشارقة",
            state_country_id: 254,
          },
        ],
        cities: [
          {
            city_id: 132,
            country_id: 254,
            stateid: 22,
            city_name: "Muwaileh",
            city_name_french: "مویله",
            delivery_charge: 15,
          },
        ],
      },
    ];
  }

  let stringifyResponse = stringifyData(response);
  if (stringifyResponse?.status) {
    await setValueRedis("state_and_city_info", stringifyResponse?.data, 1800);
  }

  return response;
};

exports.addCountriesAndStateInfo = async (countriesAndStates) => {
  try {
    for (let i = 0; i < countriesAndStates.length; i++) {
      const countryDetails = countriesAndStates[i];
      const country = await create("country", {
        country_url: countryDetails?.name?.toLowerCase()?.replace(/[" "]+/g, "-"),
        country_name: countryDetails?.name?.replace(/[']+/g, "") || "",
        country_name_french: countryDetails?.name?.replace(/[']+/g, "") || "",
        country_code: "971",
        country_status: 1,
        currency_symbol: "UAD",
        currency_code: "UAD",
      });

      const states = countryDetails["states"] || [];
      for (let j = 0; j < states.length; j++) {
        const state = states[j];
        const createdState = await create("state", {
          state_url: state?.name?.toLowerCase()?.replace(/[" "]+/g, "-"),
          state_name: state?.name?.replace(/[']+/g, "") || "",
          state_name_arabic: state?.name?.replace(/[']+/g, "") || "",
          state_country_id: country?.country_id || 254,
          statestatus: 1,
        });

        const cities = state["cities"] || [];
        for (let k = 0; k < cities.length; k++) {
          const city = cities[k];
          await create("city", {
            country_id: country?.country_id || 254,
            city_name: city?.name?.replace(/[']+/g, "") || "",
            city_name_french: city?.name?.replace(/[']+/g, "") || "",
            city_url: city?.name?.toLowerCase()?.replace(/[" "]+/g, "-"),
            delivery_charge: 0.0,
            city_latitude: String(city?.latitude ?? ""),
            city_longitude: String(city?.longitude ?? ""),
            default: 0,
            city_status: 1,
            stateid: createdState?.state_id,
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};

exports.createSessionUser = async (sessionID) => {
  try {
    await create("sessions", {
      session_id: sessionID,
      created_at: getCurrentTimestamp(),
      wishlist: "",
      cart: "",
      isMovedToUsers: 0,
    });
    return true;
  } catch (err) {
    console.log(err);
    return true;
  }
};

exports.getUserProfileUsingPhoneNumber = async (phoneNumber) => {
  const response = await findOne(
    "users",
    { phone_number: phoneNumber },
    {
      attributes: [
        "user_id",
        "firstname",
        "lastname",
        "email",
        "isGuestUser",
      ],
    }
  );
  return response || {};
};

exports.createUserAndMoveProductFromSession = async (
  userDetails,
  sessionID
) => {
  try {
    const plainPassword = userDetails["password"];
    const originalPassword =
      userDetails["originalPassword"] != null
        ? userDetails["originalPassword"]
        : plainPassword;

    const payload = {
      firstname: userDetails.firstname || "",
      lastname: userDetails.lastname || "",
      firstname_french: "",
      lastname_french: "",
      email: userDetails.email || "",
      password: md5(plainPassword),
      originalPassword,
      fb_user_id: "",
      fb_session_key: "",
      twitter_id: "",
      twitter_access_token: "",
      twitter_secret_token: 0,
      address1: userDetails.address || "",
      address2: "",
      dob: "",
      city_id: Number(userDetails?.city) || 132,
      state_id: Number(userDetails?.state) || 22,
      country_id: Number(userDetails?.country) || 254,
      phone_number: userDetails?.phone_number,
      my_favouites: "",
      payment_account_id: "",
      user_referral_balance: 0,
      merchant_account_balance: 0,
      merchant_commission: 0,
      referral_id: generateRandomString(8),
      referred_user_id: 0,
      deal_bought_count: 0,
      created_by: 0,
      user_type: 4,
      user_status: 1,
      login_type: 0,
      joined_date: getCurrentTime().unix(),
      last_login: getCurrentTime().unix(),
      facebook_update: 0,
      approve_status: 1,
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
      gender: 1,
      gplus_id: "",
      gplus_access_token: "",
      about_us: "",
      fbid: "",
      login_count: 0,
      refference_key: String(getCurrentTime().unix()),
      lang: 0,
      is_guest: 0,
      user_reg_type: 0,
      isGuestUser: userDetails?.isGuestUser != null ? Number(userDetails.isGuestUser) : 0,
    };

    const user = await create("users", payload);

    if (user) {
      const userInfo = {
        user_id: user.user_id,
        firstname: userDetails["firstname"],
        lastname: userDetails["lastname"],
        email: userDetails["email"],
        phone_number: userDetails["phone_number"],
        user_status: payload["user_status"],
      };

      if (sessionID && sessionID !== "") {
        let cartDetails = null;
        let wishlist = null;
        const sessionWishlistAndCart = await getUserSessionDetails(sessionID);

        if (
          sessionWishlistAndCart &&
          sessionWishlistAndCart.length > 0 &&
          !sessionWishlistAndCart[0]["isMovedToUsers"]
        ) {
          wishlist = sessionWishlistAndCart[0]["wishlist"];
          if (
            sessionWishlistAndCart[0]["cart"] &&
            sessionWishlistAndCart[0]["cart"] !== ""
          ) {
            const deserializedCartDetails = deserializeData(
              sessionWishlistAndCart[0]["cart"]
            );
            if (Array.isArray(deserializedCartDetails)) {
              cartDetails = deserializedCartDetails;
            }
          }
          if (cartDetails && cartDetails?.length > 0) {
            try {
              for (let i = 0; i < cartDetails.length; i++) {
                await addToCart(cartDetails[i], userInfo, true);
              }
            } catch (err) {
              console.log(err);
              return { status: 0, userInfo: {} };
            }
          }
          if (wishlist && wishlist !== "") {
            await updateOne(
              "users",
              { user_id: Number(userInfo.user_id) },
              { wishlist }
            );
          }
          await updateSessionDetails(sessionID);
        }
      }
      return { status: 1, userInfo };
    }
    return { status: 0, userInfo: {} };
  } catch (err) {
    console.log(err);
    return { status: 0, userInfo: {} };
  }
};
