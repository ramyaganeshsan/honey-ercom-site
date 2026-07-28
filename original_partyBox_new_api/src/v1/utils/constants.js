const ensureTrailingSlash = (url = "") =>
  url ? (url.endsWith("/") ? url : `${url}/`) : "";

/**
 * Build the public images base URL without duplicating `/public`.
 * Accepts either:
 *   http://localhost:5000/
 *   http://localhost:5000/public
 *   http://localhost:5000/public/
 */
const buildPublicImageFolder = (rawBase) => {
  const fallback = "http://localhost:5000/";
  let base = ensureTrailingSlash(rawBase || fallback);
  base = base.replace(/\/public\/$/i, "/");
  return `${base}public/images/`;
};

const API_BASE_RAW =
  process.env.ASSETS_URL || process.env.API_URL || "http://localhost:5000/";
const DASHBOARD_BASE_URL = ensureTrailingSlash(process.env.DASHBOARD_URL || "");

exports.BANNER_IMAGE_URL = `${DASHBOARD_BASE_URL}cloud/uploads/banner_images/`;
exports.PRODUCT_DISPLAY_IMAGE = `${DASHBOARD_BASE_URL}cloud/uploads/products/1000_800/`;
exports.PRODUCT_THUMP_DISPLAY_IMAGE = `${DASHBOARD_BASE_URL}cloud/uploads/products/80_80/`;
exports.PRODUCT_LIST_DISPLAY_IMAGE = `${DASHBOARD_BASE_URL}cloud/uploads/products/160_180/`;
exports.PUBLIC_IMAGE_FOLDER = buildPublicImageFolder(API_BASE_RAW);
exports.NO_IMAGE_URL = `${exports.PUBLIC_IMAGE_FOLDER}no_image_available.png`;
exports.NO_PROFILE_URL = `${exports.PUBLIC_IMAGE_FOLDER}no_profile.png`;

exports.PAYMENT_GATEWAY_BASE_URL = "https://apitest.myfatoorah.com";
exports.PAYMENT_SUCCESS_URL = "https://ecom.indiprotechnologies.com/success";
exports.PAYMENT_FAILED_URL = "https://ecom.indiprotechnologies.com/failed";

exports.LOGO_FOR_INVOICE = `${DASHBOARD_BASE_URL}cloud/uploads/logo/logo.png`;
exports.QR_CODE_FOR_INVOICE = `${DASHBOARD_BASE_URL}cloud/uploads/logo/qrCode.jpg`;
exports.SITENAME = "Manahel Althunayyan";
exports.STORE_ADDRESS = "Muwaileh Commercial";
exports.STORE_ADDRESS2 = "Industrial Area,Sharjah - United ArabEmirates";
exports.STORE_PHONE = "+971 555540017";
exports.STORE_EMAIL = "info@thunayanhoneyuae.com";
