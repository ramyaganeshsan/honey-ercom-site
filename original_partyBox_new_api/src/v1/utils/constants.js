const ensureTrailingSlash = (url = "") =>
  url ? (url.endsWith("/") ? url : `${url}/`) : "";

const API_BASE_URL = ensureTrailingSlash(
  process.env.ASSETS_URL || process.env.API_URL || "http://localhost:5000/"
);
const DASHBOARD_BASE_URL = ensureTrailingSlash(process.env.DASHBOARD_URL || "");

exports.BANNER_IMAGE_URL = `${DASHBOARD_BASE_URL}cloud/uploads/banner_images/`;
exports.PRODUCT_DISPLAY_IMAGE = `${DASHBOARD_BASE_URL}cloud/uploads/products/1000_800/`;
exports.PRODUCT_THUMP_DISPLAY_IMAGE = `${DASHBOARD_BASE_URL}cloud/uploads/products/80_80/`;
exports.PRODUCT_LIST_DISPLAY_IMAGE = `${DASHBOARD_BASE_URL}cloud/uploads/products/160_180/`;
exports.PUBLIC_IMAGE_FOLDER = `${API_BASE_URL}public/images/`;
exports.NO_IMAGE_URL = `${API_BASE_URL}public/images/no_image_available.png`;
exports.NO_PROFILE_URL = `${API_BASE_URL}public/images/no_profile.png`;
// exports.PAYMENT_GATEWAY_BASE_URL = "https://api.myfatoorah.com";
// exports.PAYMENT_SUCCESS_URL = "https://www.thunyanhoneyuae.com/success";
// exports.PAYMENT_FAILED_URL = "https://www.thunyanhoneyuae.com/failed";

exports.PAYMENT_GATEWAY_BASE_URL = "https://apitest.myfatoorah.com";
exports.PAYMENT_SUCCESS_URL = "https://ecom.indiprotechnologies.com/success";
exports.PAYMENT_FAILED_URL = "https://ecom.indiprotechnologies.com/failed";

// exports.PAYMENT_SUCCESS_URL = "http://localhost:3000/success";
// exports.PAYMENT_FAILED_URL = "http://localhost:3000/failed";

exports.LOGO_FOR_INVOICE = `${DASHBOARD_BASE_URL}cloud/uploads/logo/logo.png`;
exports.QR_CODE_FOR_INVOICE = `${DASHBOARD_BASE_URL}cloud/uploads/logo/qrCode.jpg`;
exports.SITENAME = "Manahel Althunayyan";
exports.STORE_ADDRESS = "Muwaileh Commercial";
exports.STORE_ADDRESS2 = "Industrial Area,Sharjah - United ArabEmirates";
exports.STORE_PHONE = "+971 555540017";
exports.STORE_EMAIL = "info@thunayanhoneyuae.com";
