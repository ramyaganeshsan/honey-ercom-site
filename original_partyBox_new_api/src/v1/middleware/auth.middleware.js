const JWT = require("jsonwebtoken");
const JOI = require("joi");
const { getMessage, getStatusCode } = require("../utils/index");

exports.validateJwtToken = (req, res, next) => {
  try {
    /* Language */
    let lang = req.get("lang") ?? "en";
    if (lang != "ar" && lang != "en") {
      lang = "en";
    }
    req.lang = lang;

    // let path = req.path;
    let path = req?.baseUrl;

    let unProtectedPaths = [
      "/api/home",
      "/",
      "/api/products",
      "/api/products/getFilters",
      "/api/products/getProductDetails",
      "/api/products/Promotions",
      "/api/review",
      "/api/contactus",
      "/api/cms/about_us",
      "/api/cms/terms_and_condition",
      "/api/cms/privacy_policy",
      "/api/cms/faqs",
      "/api/cron/productOutOfStockNotification",
      "/api/wishlist",
      "/api/cart",
      "/api/checkout",
      "/api/faqs",
      "/api/promocode",
    ];

    let userSessionID = req.get("sessionID") ?? null;
    req.userSessionID = userSessionID;

    if (
      path === "/api/auth/signup" ||
      path === "/api/auth/login" ||
      path === "/api/auth/google_signin" ||
      path === "/api/auth/facebook_signin" ||
      path === "/api/auth/twitter_signin" ||
      path === "/api/auth/twitter_callback" ||
      path === "/api/auth/send_otp" ||
      path === "/api/auth/verify_otp" ||
      path === "/api/checkout/" ||
      path === "/api/checkout/initiateTabbyPayment" ||
      path === "/api/checkout/webhooks/tabby" ||
      path === "/api/checkout/verifyTabbyPayment" ||
      path === "/api/checkout/webhooksRegister" ||
      path === "/api/checkout/tamara-webhook" ||
      path === "/api/checkout/createTamaraSesson" ||
      path === "/api/checkout/authorisePayment" ||
      path === "/api/checkout/fetchDimensions" ||
      path === "/api/checkout/" ||
      path === "/api/checkout/initiateTabbyPayment" ||
      path === "/api/checkout/webhooks/tabby" ||
      path === "/api/checkout/verifyTabbyPayment" ||
      path === "/api/checkout/webhooksRegister" ||
      path === "/api/checkout/tamara-webhook" ||
      path === "/api/checkout/createTamaraSesson" ||
      path === "/api/checkout/authorisePayment" ||
      path === "/api/checkout/fetchDimensions" ||
      path === "/api/checkout/DHLGetratingApi" ||
      path === "/api/checkout/DHLWebhook"
    ) {
      return next();
    }

    if (unProtectedPaths.includes(path)) {
      try {
        let token = req.get("token") ?? "";
        if (token) {
          token = token.split("Bearer");
          token = token[1] ?? "";
          token = token.trim();

          var decoded = JWT.verify(token, process.env.JWT_SECRECT);
          req.userDetails = decoded;
        }
        return next();
      } catch (err) {
        return next();
      }
    }

    let token = req.get("token") ?? "";
    if (token) {
      token = token.split("Bearer");
      token = token[1] ?? "";
      token = token.trim();

      var decoded = JWT.verify(token, process.env.JWT_SECRECT);
      req.userDetails = decoded;
      next();
    } else {
      return res.send({
        status: -1,
        message: "Invalid request.",
      });
    }
  } catch (err) {
    console.log(err);

    return res.send({
      status: -1,
      message: "Invalid request.",
    });
  }
};

const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

exports.validateParams = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ["params", "query", "body"]);
  const extractedParams = pick(req, Object.keys(validSchema));
  const { error } = JOI.compile(validSchema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(extractedParams);

  if (error) {
    let errors = [];
    error.details.map((details) =>
      errors.push({ key: details?.context?.key, message: details?.message })
    );
    return res.send({
      status: getStatusCode("validation_error"),
      message: getMessage("invalid_params"),
      errors: errors,
    });
  }

  next();
};
