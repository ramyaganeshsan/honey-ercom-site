const JWT = require("jsonwebtoken");
const serializedJavascript = require("serialize-javascript");
const langEnglish = require("../../../lang/english.json");
const langArabic = require("../../../lang/arabic.json");
const logger = require("../utils/logger");
const CryptoJS = require("crypto-js");
const uuidv4 = require("uuid").v4;
const tableConfig = require("../database/table.config.json");

const dayjs = require("dayjs");
var utc = require("dayjs/plugin/utc");
const timeZone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timeZone);

const TIME_ZONE = "Asia/Dubai";
exports.CurrentTimeZone = TIME_ZONE;
const dubaiTime = dayjs().tz(TIME_ZONE);

exports.generateJwtToken = (payload) => {
  try {
    let token = JWT.sign(payload, process.env.JWT_SECRECT);
    return token;
  } catch (err) {
    console.log(err);
    return null;
  }
};

exports.getMessage = (message, lang = "en") => {
  if (lang == "en") {
    return langEnglish[message] ?? message;
  }
  if (lang == "ar") {
    return langArabic[message] ?? message;
  }

  return langEnglish[message] ?? message;
};

exports.generateRandomString = (
  length = 8,
  chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
) => {
  var result = "";
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

exports.getCurrentTime = () => {
  let d = dubaiTime;
  return d;
};

exports.getStatusCode = (type) => {
  let statusCode = "";
  switch (type) {
    case "success":
      statusCode = 1;
      break;
    case "failed":
      statusCode = 0;
      break;
    case "token_error":
      statusCode = -1;
      break;
    case "server_error":
      statusCode = -2;
      break;
    case "validation_error":
      statusCode = -3;
      break;
    case "invalid_route":
      statusCode = -4;
      break;
    case "invalid_user":
      statusCode = -5;
      break;
    case "order_placed_cod":
      statusCode = 2;
      break;
    case "session_expired":
      statusCode = 3;
      break;
    default:
      statusCode = 1;
      break;
  }
  return statusCode;
};

const DEFAULT_REDIS_EXPIRY_TIME = 5; // in Seconds
exports.getValueFromRedis = async (key) => {
  if (process.env.NODE_ENV === "development") return null;

  try {
    let response = await REDIS_CLIENT.get(key);
    return response;
  } catch (err) {
    logger.error(err?.message);
    return null;
  }
};

exports.setValueRedis = async (
  key,
  value,
  expiry = DEFAULT_REDIS_EXPIRY_TIME
) => {
  try {
    await REDIS_CLIENT.set(key, value, { EX: expiry });
    return 1;
  } catch (err) {
    logger.error(err?.message);
    return 0;
  }
};

exports.stringifyData = (data) => {
  try {
    data = JSON.stringify(data);
    return { status: 1, data };
  } catch (err) {
    logger.error("Failed to stringlfy data");
    logger.info(data);
    return { status: 0, data: "" };
  }
};

exports.parseData = (data) => {
  try {
    data = JSON.parse(data);
    return { status: 1, data };
  } catch (err) {
    logger.error("Failed to parse data");
    logger.info(data);
    return { status: 0, data: "" };
  }
};

exports.serializeData = (data) => {
  return serializedJavascript(data);
};

exports.deserializeData = (data) => {
  return eval("(" + data + ")");
};

exports.shopOpensAtTitle = "Saturday - Thursday";
exports.shopOpensAtTime = "8 AM - 10 PM";
exports.shopOpensAtWeekendTitle = "Friday";
exports.shopOpensAtWeekendTime = "2 PM - 10 PM";

exports.encrypteString = (string) => {
  var encryptedData = CryptoJS.AES.encrypt(
    string,
    process.env.APP_SECRECT_KEY
  ).toString();
  return encryptedData;
};

exports.decrypteString = (string) => {
  var decryptBytes = CryptoJS.AES.decrypt(string, process.env.APP_SECRECT_KEY);
  var decryptData = decryptBytes.toString(CryptoJS.enc.Utf8);
  return decryptData;
};

exports.sortFilter = [
  {
    value: "newest",
    key: "newest",
  },
  {
    value: "oldest",
    key: "oldest",
  },
  {
    value: "mintomax",
    key: "mintomax",
  },
  {
    value: "maxtomin",
    key: "maxtomin",
  },
];

exports.itemsPerPage = [20, 10, 15];

exports.getCurrentTimestamp = () => {
  return dayjs().tz(TIME_ZONE).unix();
};

exports.getCurrentDate = () => {
  return dayjs().tz(TIME_ZONE).toDate();
};

// exports.currencyFormatter = (totalAmount, currency = "UAD") => {
//   let fotmatter = new Intl.NumberFormat("en-US", {
//     currency: currency,
//   });
//   return Number(fotmatter.format(totalAmount));
// };

exports.currencyFormatter = (totalAmount, currency = "USD") => {
  let formatter = new Intl.NumberFormat("en-US", {
    currency: currency,
  });
  let formattedNumber = formatter.format(totalAmount);
  return +formattedNumber.replace(/,/g, "");
};

exports.calculateProductDiscountAndSavings = (actualPrice, discountPrice) => {
  var difference = parseFloat(actualPrice) - parseFloat(discountPrice);
  var percent = parseFloat((difference / actualPrice) * 100).toFixed(2);
  if (percent == 100) {
    percent = 0;
  }
  return { savings: Number(difference), discount: Number(percent) };
};

exports.discountCalculator = (type, discount, total) => {
  let totalDiscount = discount;
  if (Number(type) === 1) {
    totalDiscount = (Number(total) * Number(discount)) / 100;
  }
  return isNaN(totalDiscount) ? 0 : totalDiscount;
};

exports.isValidUserDetails = (userDetails) => {
  if (!userDetails || typeof userDetails !== "object") {
    return false;
  }

  if (userDetails && userDetails?.user_id) {
    return true;
  }

  return false;
};

exports.getUUID = () => {
  return uuidv4();
};

exports.updateSessionDetails = async (sessionID) => {
  const { updateOne } = require("../mongo/repo");
  await updateOne("sessions", { session_id: sessionID }, { isMovedToUsers: 1 });
};

exports.checkProductIsActive = async (productId) => {
  const { count } = require("../mongo/repo");
  const productCount = await count("product", {
    deal_id: Number(productId),
    deal_status: 1,
  });
  return productCount > 0;
};

exports.getUserSessionDetails = async (sessionID) => {
  const { findOne } = require("../mongo/repo");
  const doc = await findOne(
    "sessions",
    { session_id: sessionID },
    { attributes: ["cart", "wishlist", "isMovedToUsers"] }
  );
  return doc ? [doc] : [];
};
