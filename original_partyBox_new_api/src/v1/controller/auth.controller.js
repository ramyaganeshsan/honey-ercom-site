const {
  getStatusCode,
  getMessage,
  generateJwtToken,
} = require("../utils/index");
const {
  getUserLoginDetails,
  createUser,
  moveWishlistAndCartProductsFromSession,
  getUserGoogleLoginDetails,
} = require("../services/auth.services");
const {
  checkUserEmailExists,
  checkUserPhoneNumberExists,
} = require("../services/common.services");
const logger = require("../utils/logger");

const crypto = require("crypto");
const axios = require("axios");
const OAuth = require("oauth-1.0a");
const bodyParser = require("body-parser");

const consumer_key = process.env.TWITTER_CONSUMER_KEY;
const consumer_secret = process.env.TWITTER_CONSUMER_SECRET;

const oauth = OAuth({
  consumer: { key: consumer_key, secret: consumer_secret },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});

const qs = require("querystring");

const generateOauthSignature = (baseString, signingKey) => {
  return crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");
};

const generateOauthHeader = (params) => {
  return (
    "OAuth " +
    Object.keys(params)
      .map(
        (key) =>
          `${encodeURIComponent(key)}="${encodeURIComponent(params[key])}"`
      )
      .join(", ")
  );
};

const generateRandomPassword = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 8;
  let randomPassword = "";
  for (let i = 0; i < length; i++) {
    randomPassword += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return randomPassword;
};

exports.signup = async (req, res, next) => {
  try {
    let isEmailAlreadyExists = await checkUserEmailExists(req.body.email);
    if (isEmailAlreadyExists) {
      return res.send({
        status: getStatusCode("failed"),
        message: getMessage("email_already_exists", req.lang),
      });
    }

    let isPhoneNumberAlreadyExists = await checkUserPhoneNumberExists(
      req.body.phone_number
    );
    if (isPhoneNumberAlreadyExists) {
      return res.send({
        status: getStatusCode("failed"),
        message: getMessage("phone_already_exists", req.lang),
      });
    }

    let user = await createUser(req?.body);
    if (user) {
      let userDetails = {
        user_id: user?.user_id,
        firstname: user?.firstname,
        lastname: user?.lastname,
        email: user?.email,
        phone_number: user?.phone_number,
        user_status: user?.user_status,
      };

      let sessionID = req.userSessionID;
      if (sessionID) {
        await moveWishlistAndCartProductsFromSession(sessionID, userDetails);
      }

      let userInfo = {
        firstname: user?.firstname,
        user_id: user?.user_id,
        lastname: user?.lastname,
        token: generateJwtToken(userDetails),
      };

      res.send({
        status: getStatusCode("success"),
        message: getMessage("account_successfully_created", req.lang),
        data: {
          userDetails: userInfo,
        },
      });
    } else {
      res.send({
        status: getStatusCode("failed"),
        message: getMessage("account_failed_created", req.lang),
      });
    }
  } catch (err) {
    logger.error(err);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    let userDetails = await getUserLoginDetails(req.body);

    let status = getStatusCode("success");
    let message = getMessage("successfully_log_in", req.lang);
    let userInfo = {};

    if (
      userDetails &&
      Object.keys(userDetails).length > 0 &&
      Number(userDetails?.user_status) === 1
    ) {
      userInfo = {
        firstname: userDetails?.firstname,
        user_id: userDetails?.user_id,
        lastname: userDetails?.lastname,
        token: generateJwtToken(userDetails),
      };
      let sessionID = req.userSessionID;
      if (sessionID) {
        await moveWishlistAndCartProductsFromSession(sessionID, userInfo, true);
      }
    } else if (Number(userDetails?.user_status) === 0) {
      status = getStatusCode("failed");
      message = getMessage("user_account_blocked", req.lang);
    } else {
      status = getStatusCode("failed");
      message = getMessage("invalid_login_details", req.lang);
    }

    res.send({
      status: status,
      message: message,
      data: {
        userDetails: userInfo,
      },
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};

exports.googleSignIn = async (req, res, next) => {
  try {
    const { access_token } = req.body;

    const userInfoResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
    );

    // Extract the JSON data from the response
    const userInfo = userInfoResponse.data;
    const { email, given_name, family_name } = userInfo;

    let userDetails = await getUserGoogleLoginDetails({ email });

    if (!userDetails) {
      const randomPassword = generateRandomPassword();
      const newUser = await createUser({
        email,
        firstname: given_name,
        lastname: family_name || "",
        password: randomPassword,
        user_status: 1,
        loginFrom: "google",
      });

      userDetails = {
        user_id: newUser?.user_id,
        firstname: newUser?.firstname,
        lastname: newUser?.lastname || "",
        email: newUser?.email,
        phone_number: newUser?.phone_number || "",
        user_status: newUser?.user_status,
      };
    }

    let status = getStatusCode("success");
    let message = getMessage("successfully_log_in", req.lang);
    let userData = {};

    if (Number(userDetails.user_status) === 1) {
      // Generate JWT token
      const jwtToken = generateJwtToken(userDetails);

      // Move wishlist and cart products if session ID exists
      const sessionID = req.userSessionID;
      if (sessionID) {
        await moveWishlistAndCartProductsFromSession(
          sessionID,
          userDetails,
          true
        );
      }

      userData = {
        firstname: userDetails.firstname,
        user_id: userDetails.user_id,
        lastname: userDetails.lastname,
        token: jwtToken,
      };
    } else {
      status = getStatusCode("failed");
      message = getMessage("user_account_blocked", req.lang);
    }
    res.header("Referrer-Policy", "no-referrer-when-downgrade");

    res.send({
      status: status,
      message: message,
      data: {
        userDetails: userData,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

exports.facebookSignin = async (req, res, next) => {
  try {
    const { code } = req.body;

    const clientId = process.env.FACEBOOK_APP_ID;
    const clientSecret = process.env.FACEBOOK_APP_SECRECT;
    const redirectUri = process.env.FACEBOOK_CALLBACL_URL;
    const accessTokenUrl = `https://graph.facebook.com/v12.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`;

    const response = await axios.get(accessTokenUrl);
    const accessToken = response.data.access_token;

    const userInfoUrl = `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`;
    const userInfoResponse = await axios.get(userInfoUrl);

    const { email, name, picture, id } = userInfoResponse.data;

    let userDetails = await getUserGoogleLoginDetails({ email });

    if (!userDetails) {
      const randomPassword = generateRandomPassword();
      const newUser = await createUser({
        email,
        firstname: name.split(" ")[0],
        lastname: name.split(" ")[1] || "",
        password: randomPassword,
        user_status: 1,
        loginFrom: "facebook",
      });

      userDetails = {
        user_id: newUser?.user_id,
        firstname: newUser?.firstname,
        lastname: newUser?.lastname || "",
        email: newUser?.email,
        phone_number: newUser?.phone_number || "",
        user_status: newUser?.user_status,
      };
    }

    let status = getStatusCode("success");
    let message = getMessage("successfully_log_in", req.lang);
    let userData = {};

    if (Number(userDetails.user_status) === 1) {
      // Generate JWT token
      const jwtToken = generateJwtToken(userDetails);

      // Move wishlist and cart products if session ID exists
      const sessionID = req.userSessionID;
      if (sessionID) {
        await moveWishlistAndCartProductsFromSession(
          sessionID,
          userDetails,
          true
        );
      }

      userData = {
        firstname: userDetails.firstname,
        user_id: userDetails.user_id,
        lastname: userDetails.lastname,
        token: jwtToken,
      };
    } else {
      status = getStatusCode("failed");
      message = getMessage("user_account_blocked", req.lang);
    }
    res.header("Referrer-Policy", "no-referrer-when-downgrade");

    res.send({
      status: status,
      message: message,
      data: {
        userDetails: userData,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

exports.twitterSignin = async (req, res) => {
  try {
    const oauth_timestamp = Math.floor(Date.now() / 1000);
    const oauth_nonce = crypto.randomBytes(16).toString("hex");
    const callback_url = process.env.TWITTER_CALLBACK_URL;
    const consumer_key = process.env.TWITTER_CONSUMER_KEY;
    const consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessTokenSecret = process.env.TWITTER_ACCESS_SECRET;

    const httpMethod = "POST";
    const baseUrl = "https://api.twitter.com/oauth/request_token";
    const params = {
      oauth_callback: callback_url,
      oauth_consumer_key: consumer_key,
      oauth_nonce: oauth_nonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: oauth_timestamp,
      oauth_version: "1.0",
      oauth_token: accessToken,
    };

    const encodedParams = {};
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        encodedParams[encodeURIComponent(key)] = encodeURIComponent(
          params[key]
        );
      }
    }

    const sortedKeys = Object.keys(encodedParams).sort();
    const parameterString = sortedKeys
      .map((key) => `${key}=${encodedParams[key]}`)
      .join("&");

    const encodedBaseUrl = encodeURIComponent(baseUrl);
    const encodedParameterString = encodeURIComponent(parameterString);

    const baseString = `${httpMethod}&${encodedBaseUrl}&${encodedParameterString}`;

    const signingKey = `${encodeURIComponent(
      consumer_secret
    )}&${encodeURIComponent(accessTokenSecret)}`;

    const hmac = crypto.createHmac("sha1", signingKey);
    hmac.update(baseString);
    const oauthSignature = encodeURIComponent(hmac.digest("base64"));

    const authHeader = `OAuth oauth_nonce="${
      encodedParams[encodeURIComponent("oauth_nonce")]
    }",oauth_callback="${
      encodedParams[encodeURIComponent("oauth_callback")]
    }",oauth_consumer_key="${
      encodedParams[encodeURIComponent("oauth_consumer_key")]
    }",oauth_signature="${oauthSignature}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${
      encodedParams[encodeURIComponent("oauth_timestamp")]
    }",oauth_version="1.0",oauth_token="${
      encodedParams[encodeURIComponent("oauth_token")]
    }"`;

    console.log("authheaser : ", authHeader);
    const response = await axios.post(
      "https://api.twitter.com/oauth/request_token",
      qs.stringify({}),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: authHeader,
        },
      }
    );
    const responseParams = qs.parse(response.data);
    if (responseParams.oauth_callback_confirmed === "true") {
      const url = `https://api.twitter.com/oauth/authenticate?oauth_token=${responseParams.oauth_token}`;
      res.send({ data: { redirectUrl: url } });
    } else {
      res.status(500).json({ message: "Twitter authentication failed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Twitter authentication failed", error });
  }
};
exports.twitterCallback = async (req, res) => {
  const { oauth_token, oauth_verifier } = req.body;

  try {
    const consumer_key = process.env.TWITTER_CONSUMER_KEY;
    const consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
    const oauth_timestamp = Math.floor(Date.now() / 1000);
    const oauth_nonce = crypto.randomBytes(16).toString("hex");

    const httpMethod = "POST";
    const baseUrl = "https://api.twitter.com/oauth/access_token";
    const params = {
      oauth_consumer_key: consumer_key,
      oauth_nonce: oauth_nonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: oauth_timestamp,
      oauth_token: oauth_token,
      oauth_verifier: oauth_verifier,
      oauth_version: "1.0",
    };

    const parameterString = Object.keys(params)
      .sort()
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join("&");

    const baseString = `${httpMethod}&${encodeURIComponent(
      baseUrl
    )}&${encodeURIComponent(parameterString)}`;
    const signingKey = `${encodeURIComponent(consumer_secret)}&`;

    const oauth_signature = generateOauthSignature(baseString, signingKey);
    const authHeader = generateOauthHeader({ ...params, oauth_signature });

    const response = await axios.post(
      baseUrl,
      qs.stringify({ oauth_verifier }),
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const responseParams = qs.parse(response.data);
    const {
      oauth_token: accessToken,
      oauth_token_secret: tokenSecret,
      user_id: userId,
      screen_name: screenName,
    } = responseParams;

    const verifyRequestData = {
      url: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
      method: "GET",
    };

    const verifyAccessToken = {
      key: accessToken,
      secret: tokenSecret,
    };

    const verifyHeaders = oauth.toHeader(
      oauth.authorize(verifyRequestData, verifyAccessToken)
    );

    const userDetailsResponse = await axios.get(verifyRequestData.url, {
      headers: {
        Authorization: verifyHeaders.Authorization,
      },
    });

    let { email, name } = userDetailsResponse.data;

    if (!email) {
      email = `${screenName}@twitter.com`;
    }
    let userDetails = await getUserGoogleLoginDetails({ email });

    if (!userDetails) {
      const randomPassword = generateRandomPassword();

      const newUser = await createUser({
        email,
        firstname: name.split(" ")[0],
        lastname: name.split(" ")[1] || "",
        password: randomPassword,
        user_status: 1,
        loginFrom: "twitter",
      });

      userDetails = {
        user_id: newUser.user_id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        phone_number: newUser.phone_number,
        user_status: newUser.user_status,
      };
    }

    let status = getStatusCode("success");
    let message = getMessage("successfully_log_in", req.lang);
    let userData = {};

    if (Number(userDetails.user_status) === 1) {
      const jwtToken = generateJwtToken(userDetails);

      const sessionID = req.userSessionID;
      if (sessionID) {
        await moveWishlistAndCartProductsFromSession(
          sessionID,
          userDetails,
          true
        );
      }

      userData = {
        firstname: userDetails.firstname,
        user_id: userDetails.user_id,
        lastname: userDetails.lastname,
        token: jwtToken,
      };
    } else {
      status = getStatusCode("failed");
      message = getMessage("user_account_blocked", req.lang);
    }

    res.header("Referrer-Policy", "no-referrer-when-downgrade");

    res.send({
      status: status,
      message: message,
      data: {
        userDetails: userData,
      },
    });
    res.redirect("/");
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "Twitter callback processing failed", error });
  }
};

const {
  createAndStoreOtp,
  verifyStoredOtp,
} = require("../services/otp.services");

/**
 * POST /api/auth/send_otp
 * body: { email_or_phone: "..." }
 * Stores hashed OTP in `otp` and plain value in `original_otp`.
 */
exports.sendOtp = async (req, res, next) => {
  try {
    const emailOrPhone =
      req.body?.email_or_phone ||
      req.body?.email ||
      req.body?.phone_number ||
      "";

    if (!emailOrPhone) {
      return res.send({
        status: getStatusCode("validation_error"),
        message: getMessage("something_went_wrong_error", req.lang),
        data: {},
      });
    }

    const result = await createAndStoreOtp(emailOrPhone);

    // In development, return OTP so local testing works without SMS gateway.
    const includePlainOtp =
      process.env.NODE_ENV === "development" ||
      process.env.RETURN_OTP_IN_RESPONSE === "true";

    return res.send({
      status: getStatusCode("success"),
      message: getMessage("success", req.lang) || "OTP sent",
      data: {
        otp_id: result.otp_id,
        ...(includePlainOtp ? { otp: result.otp } : {}),
      },
    });
  } catch (err) {
    logger.error(err?.message || err);
    next(err);
  }
};

/**
 * POST /api/auth/verify_otp
 * body: { email_or_phone: "...", otp: "123456" }
 */
exports.verifyOtp = async (req, res, next) => {
  try {
    const emailOrPhone =
      req.body?.email_or_phone ||
      req.body?.email ||
      req.body?.phone_number ||
      "";
    const otp = req.body?.otp || "";

    if (!emailOrPhone || !otp) {
      return res.send({
        status: getStatusCode("validation_error"),
        message: getMessage("something_went_wrong_error", req.lang),
        data: { verified: false },
      });
    }

    const result = await verifyStoredOtp(emailOrPhone, otp);
    return res.send({
      status: result.valid
        ? getStatusCode("success")
        : getStatusCode("failed"),
      message: result.valid
        ? "OTP verified"
        : getMessage("something_went_wrong_error", req.lang),
      data: { verified: Boolean(result.valid) },
    });
  } catch (err) {
    logger.error(err?.message || err);
    next(err);
  }
};
