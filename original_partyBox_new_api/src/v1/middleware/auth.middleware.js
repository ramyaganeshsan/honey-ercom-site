const JWT = require("jsonwebtoken");
const JOI = require("joi");
const { getMessage, getStatusCode, resolveJwtSecret } = require("../utils/index");

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
      "/api/common",
      "/api/checkoutTest",
    ];

    let userSessionID = req.get("sessionID") ?? null;
    req.userSessionID = userSessionID;

    const isUnprotectedPrefix = (prefix) =>
      path === prefix || path.startsWith(prefix + "/");

    // Auth/signup paths skip JWT entirely. `/api/checkout` must NOT be here —
    // it is unprotected (guest + logged-in) and needs optional JWT decode below
    // so logged-in carts resolve by user_id. Skipping decode made checkout
    // return "Your cart is empty" even when /api/cart had items.
    if (
      isUnprotectedPrefix("/api/auth/signup") ||
      isUnprotectedPrefix("/api/auth/login") ||
      isUnprotectedPrefix("/api/auth/google_signin") ||
      isUnprotectedPrefix("/api/auth/facebook_signin") ||
      isUnprotectedPrefix("/api/auth/twitter_signin") ||
      isUnprotectedPrefix("/api/auth/twitter_callback") ||
      isUnprotectedPrefix("/api/auth/send_otp") ||
      isUnprotectedPrefix("/api/auth/verify_otp") ||
      isUnprotectedPrefix("/api/admin/auth")
    ) {
      return next();
    }

    // `/api/*` middleware sets baseUrl to the full path, so match prefixes
    if (unProtectedPaths.some((p) => isUnprotectedPrefix(p))) {
      try {
        let token = req.get("token") ?? "";
        if (token) {
          token = token.split("Bearer");
          token = token[1] ?? "";
          token = token.trim();

          var decoded = JWT.verify(token, resolveJwtSecret());
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

      var decoded = JWT.verify(token, resolveJwtSecret());
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
