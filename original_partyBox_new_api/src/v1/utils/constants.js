const ensureTrailingSlash = (url = "") =>
  url ? (url.endsWith("/") ? url : `${url}/`) : "";

/**
 * Clean env URL values.
 * Common mistake: pasting the whole line as the value, e.g.
 *   DASHBOARD_URL=DASHBOARD_URL=https://api.example.com/
 * which produces broken image URLs in the browser.
 */
const cleanEnvUrl = (raw = "") => {
  let value = String(raw || "").trim().replace(/^['"]|['"]$/g, "");
  value = value.replace(
    /^(DASHBOARD_URL|API_URL|ASSETS_URL|WEBSITE_URL)\s*=\s*/i,
    ""
  );
  return value.trim();
};

const API_BASE_URL = ensureTrailingSlash(
  cleanEnvUrl(
    process.env.ASSETS_URL || process.env.API_URL || "http://localhost:5000/"
  )
);

// Uploads (/cloud/...) must be served by the API host, not the admin UI host.
const DASHBOARD_BASE_URL = ensureTrailingSlash(
  cleanEnvUrl(process.env.DASHBOARD_URL) ||
    cleanEnvUrl(process.env.API_URL) ||
    API_BASE_URL
);

exports.BANNER_IMAGE_URL = `${DASHBOARD_BASE_URL}cloud/uploads/banner_images/`;
exports.PRODUCT_DISPLAY_IMAGE = `${DASHBOARD_BASE_URL}cloud/uploads/products/1000_800/`;
exports.PRODUCT_THUMP_DISPLAY_IMAGE = `${DASHBOARD_BASE_URL}cloud/uploads/products/80_80/`;
exports.PRODUCT_LIST_DISPLAY_IMAGE = `${DASHBOARD_BASE_URL}cloud/uploads/products/160_180/`;
exports.PUBLIC_IMAGE_FOLDER = `${API_BASE_URL}public/images/`;
exports.NO_IMAGE_URL = `${API_BASE_URL}public/images/no_image_available.png`;
exports.NO_PROFILE_URL = `${API_BASE_URL}public/images/no_profile.png`;

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
