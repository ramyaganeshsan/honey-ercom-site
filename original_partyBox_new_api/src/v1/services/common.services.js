const { users, settings, city, country, state } = require("../models");
const sequelize = require("sequelize");
const tableConfig = require("../database/table.config.json");
const { Op } = sequelize;
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
  serializeData,
  deserializeData,
  getUserSessionDetails,
} = require("../utils");
const { PUBLIC_IMAGE_FOLDER } = require("../utils/constants");
const md5 = require("md5");
const {
  moveWishlistAndCartProductsFromSession,
  createUser,
} = require("./auth.services");
const { addToCart } = require("./cart.services");

exports.checkUserEmailExists = async (email, id = "") => {
  let condition = {
    email: email,
  };
  if (id && id != "") {
    condition["user_id"] = {
      [Op.not]: parseInt(id),
    };
  }
  let filter = {
    where: condition,
  };
  let response = await users.count(filter);
  return response;
};

exports.checkUserPhoneNumberExists = async (phoneNumber, id = "") => {
  let condition = {
    phone_number: phoneNumber,
  };
  if (id && id != "") {
    condition["user_id"] = {
      [Op.not]: parseInt(id),
    };
  }
  let filter = {
    where: condition,
  };
  let response = await users.count(filter);
  return response;
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

const isUnknownColumnError = (err) =>
  Boolean(
    err?.message &&
      /Unknown column|does not exist|no such column/i.test(err.message)
  );

exports.getSiteInfo = async () => {
  let siteSettingsDetails = await getValueFromRedis("site_settings");
  if (siteSettingsDetails) {
    let parsedResponse = parseData(siteSettingsDetails);
    if (parsedResponse?.status) return parsedResponse?.data;
  }

  let response = null;
  try {
    response = await settings.findOne({
      attributes: [
        ...SITE_SETTINGS_ATTRIBUTES,
        ...OPTIONAL_SITE_SETTINGS_ATTRIBUTES,
      ],
      raw: true,
    });
  } catch (err) {
    // Older DBs may not have the optional notification columns yet.
    if (isUnknownColumnError(err)) {
      response = await settings.findOne({
        attributes: SITE_SETTINGS_ATTRIBUTES,
        raw: true,
      });
    } else {
      throw err;
    }
  }

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

  let condition = {
    country_status: 1,
  };
  let filters = {
    where: condition,
    attributes: ["country_name", "country_id", "country_code"],
    // attributes: ["country_name", "country_id"],

    include: [
      {
        model: city,
        attributes: [
          "city_id",
          "country_id",
          "stateid",
          "city_name",
          "city_name_french",
          "delivery_charge",
        ],
        where: {
          city_status: 1,
        },
      },
      {
        model: state,
        attributes: ["state_id", "state_name", "state_name_arabic"],
        where: {
          statestatus: 1,
        },
      },
    ],
  };

  let response = await country.findAll(filters);

  // Normalize for older UI code that still reads ISO_country_code
  response = (response || []).map((row) => {
    const plain = typeof row?.toJSON === "function" ? row.toJSON() : row;
    return {
      ...plain,
      ISO_country_code: plain?.ISO_country_code ?? plain?.country_code ?? "",
    };
  });

  let stringifyResponse = stringifyData(response);
  if (stringifyResponse?.status) {
    await setValueRedis("state_and_city_info", stringifyResponse?.data, 1800);
  }

  return response;
};

exports.addCountriesAndStateInfo = async (countriesAndStates) => {
  /*
  let transaction = await global.SEQUELIZE.transaction();

  try {
    for (let i = 0; i < countriesAndStates.length; i++) {
       
        let countryDetails = countriesAndStates[i];

        let insertConfig = {
          type: global?.SEQUELIZE?.QueryTypes?.INSERT,
          transaction: transaction,
        };

        let insertCountryQuery = `
          INSERT 
          INTO 
          ${tableConfig.country}
          (
            country_url,
            country_name,
            country_name_french,
            country_code,
            country_status,
            currency_symbol,
            currency_code
          ) 
          VALUES (
            '${countryDetails?.name?.toLowerCase()?.replace(/[" "]+/g, "-")}',
            '${countryDetails?.name?.replace(/[']+/g, "")}',
            '${countryDetails?.name?.replace(/[']+/g, "")}',
            '${971}',
            '${1}',
            '${"UAD"}',
            '${"UAD"}'
          );
        `;

        let [insertedId] = await global?.SEQUELIZE?.query(
          insertCountryQuery,
          insertConfig
        );
        console.log(insertedId);
      

      let insertConfig = {
        type: global?.SEQUELIZE?.QueryTypes?.INSERT,
        transaction: transaction,
      };

      let states = countriesAndStates[i]["states"];
      for (let j = 0; j < states.length; j++) {
        let state = states[j];
        let insertStateQuery = `
          INSERT 
          INTO 
          ${tableConfig.state}
          (
            state_url,
            state_name,
            state_name_arabic,
            state_country_id,
            statestatus
          ) 
          VALUES (
            '${state?.name?.toLowerCase()?.replace(/[" "]+/g, "-")}',
            '${state?.name?.replace(/[']+/g, "")}',
            '${state?.name?.replace(/[']+/g, "")}',
            ${254},
            ${1}
          );
        `;

        let [insertedId] = await global?.SEQUELIZE?.query(
          insertStateQuery,
          insertConfig
        );

        let cities = state["cities"];
        for (let k = 0; k < cities.length; k++) {
          let city = cities[k];
          let insertCityQuery = `
            INSERT 
            INTO 
            ${tableConfig.city}
            (
              country_id,
              city_name,
              city_name_french,
              city_url,
              delivery_charge,
              city_latitude,
              city_longitude,
              city_status,
              stateid
            ) 
            VALUES (
              ${254},
              '${city?.name?.replace(/[']+/g, "")}',
              '${city?.name?.replace(/[']+/g, "")}',
              '${city?.name?.toLowerCase()?.replace(/[" "]+/g, "-")}',
              ${0.0},
              '${city?.latitude}',
              '${city?.longitude}',
              ${1},
              ${insertedId}
            );
          `;
          await global?.SEQUELIZE?.query(insertCityQuery, insertConfig);
        }
      }
    }
    await transaction.commit();
  } catch (err) {
    console.log(err);
    transaction.rollback();
  }
  */
};

exports.createSessionUser = async (sessionID, insertConfig = null) => {
  let query = `INSERT INTO ${
    tableConfig.sessions
  } (session_id, created_at, wishlist, cart) VALUES ("${sessionID}", ${getCurrentTimestamp()}, "", "")`;

  let config = { type: global?.SEQUELIZE?.QueryTypes?.INSERT };
  if (insertConfig) {
    config = insertConfig;
  }

  try {
    await global?.SEQUELIZE?.query(query, config);
    return true;
  } catch (err) {
    console.log(err);
    return true;
  }
};

exports.getUserProfileUsingPhoneNumber = async (phoneNumber, selectConfig) => {
  let query = `SELECT 
    user_id, 
    firstname, 
    lastname, 
    email,
    isGuestUser 
  FROM ${tableConfig.users} WHERE phone_number='${phoneNumber}'`;
  let config = { type: global?.SEQUELIZE?.QueryTypes?.SELECT };
  if (selectConfig) {
    config = selectConfig;
  }
  let response = await global?.SEQUELIZE?.query(query, config);
  return response && response.length > 0 ? response[0] : {};
};

exports.createUserAndMoveProductFromSession = async (
  userDetails,
  sessionID
) => {
  let transaction = await global.SEQUELIZE.transaction();
  try {
    userDetails["password"] = md5(userDetails["password"]);
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

    let insertQuery = `INSERT INTO ${tableConfig.users} (
    firstname,lastname,
    firstname_french,lastname_french,email,
    password,fb_user_id,fb_session_key,
    twitter_id,twitter_access_token,twitter_secret_token,
    address1,address2,dob,
    city_id,state_id,country_id,
    phone_number,my_favouites,payment_account_id,
    user_referral_balance,merchant_account_balance,merchant_commission,
    referral_id,referred_user_id,deal_bought_count,
    created_by,user_type,user_status,
    login_type,joined_date,last_login,
    facebook_update,approve_status,wishlist,
    ship_name,ship_address1,ship_address2,
    ship_state,ship_country,ship_city,
    ship_mobileno,ship_zipcode,AccountCountryCode,
    AccountEntity,AccountNumber,AccountPin,UserName,
    ShippingPassword,flat_amount,change_password_must,
    gender,gplus_id,gplus_access_token,about_us,
    fbid,login_count,refference_key,lang,
    is_guest,user_reg_type,isGuestUser,originalPassword) 
  VALUES (
    '${userDetails.firstname?.replace(/[']+/g, " ")}',
    '${userDetails.lastname?.replace(/[']+/g, " ")}',
    '','',
    '${userDetails.email?.replace(/[']+/g, " ")}',
    '${userDetails.password?.replace(/[']+/g, " ")}',
    '','','','',0,
    '${userDetails.address?.replace(/[']+/g, " ")}',
    '','',
    ${Number(userDetails?.city)},${Number(userDetails?.state)},${Number(
      userDetails?.country
    )},
    '${userDetails?.phone_number}',
    '','',0,0,0,
    '${userDetails?.referral_id}',
    0,0,0,4,1,0,
    ${userDetails["joined_date"]},
    ${userDetails["joined_date"]},
    0,1,'','','','','',0,0,'',0,'','','','','','',0,0,1,'','','','',0,
    ${userDetails["refference_key"]},
    0,0,0,1,'${userDetails?.originalPassword}'
  )`;

    let insertConfig = {
      type: global?.SEQUELIZE?.QueryTypes?.INSERT,
      transaction: transaction,
    };
    let selectConfig = {
      type: global?.SEQUELIZE?.QueryTypes?.SELECT,
      transaction: transaction,
    };
    let updateConfig = {
      type: global?.SEQUELIZE?.QueryTypes?.UPDATE,
      transaction: transaction,
    };

    let [user] = await global?.SEQUELIZE?.query(insertQuery, insertConfig);

    if (user) {
      let userInfo = {
        user_id: user,
        firstname: userDetails["firstname"],
        lastname: userDetails["lastname"],
        email: userDetails["email"],
        phone_number: userDetails["phone_number"],
        user_status: userDetails["user_status"],
      };

      if (sessionID) {
        let cartDetails = null;
        let wishlist = null;
        if (sessionID && sessionID !== "") {
          let sessionWishlistAndCart = await getUserSessionDetails(
            sessionID,
            selectConfig
          );

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
              let deserializedCartDetails = deserializeData(
                sessionWishlistAndCart[0]["cart"]
              );
              if (Array.isArray(deserializedCartDetails)) {
                cartDetails = deserializedCartDetails;
              }
            }
            if (cartDetails && cartDetails?.length > 0) {
              try {
                /* Insert cart details into cart_items collection */
                for (let i = 0; i < cartDetails.length; i++) {
                  await addToCart(cartDetails[i], userInfo, true);
                }
              } catch (err) {
                console.log(err);
                await transaction.rollback();
                return { status: 0, userInfo: {} };
              }
            }
            if (wishlist && wishlist !== "") {
              let query = `UPDATE ${
                tableConfig.users
              } SET wishlist="${wishlist}" WHERE user_id = ${Number(
                userInfo.user_id
              )}`;
              await global?.SEQUELIZE?.query(query, updateConfig);
            }

            /* Remove session cart details. */
            // let serializeCartDetails = serializeData([]);
            // let query = `UPDATE ${tableConfig.sessions} SET cart='${serializeCartDetails}' WHERE session_id = '${sessionID}' AND isMovedToUsers = 0`;
            // await global?.SEQUELIZE?.query(query, updateConfig);
          }
        }
      }
      await transaction.commit();
      return { status: 1, userInfo };
    } else {
      await transaction.rollback();
      return { status: 0, userInfo: {} };
    }
  } catch (err) {
    await transaction.rollback();
    console.log(err);
    return { status: 0, userInfo: {} };
  }
};
