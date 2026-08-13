/**
 * Vite env helpers with CRA fallbacks.
 * Prefer VITE_* (import.meta.env); fall back to process.env.REACT_APP_* / VITE_*.
 */
const metaEnv =
  typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};
const procEnv =
  typeof process !== "undefined" && process.env ? process.env : {};

function read(viteKey, reactKey, fallback = "") {
  const value =
    metaEnv[viteKey] ?? procEnv[reactKey] ?? procEnv[viteKey] ?? fallback;
  return value == null ? fallback : value;
}

export const env = {
  BASE_URL: read(
    "VITE_BASE_URL",
    "REACT_APP_BASE_URL",
    "http://localhost:5000/api"
  ),
  ASSETS_URL: read(
    "VITE_ASSETS_URL",
    "REACT_APP_ASSETS_URL",
    "http://localhost:5000/public"
  ),
  SITE_NAME: read("VITE_SITE_NAME", "REACT_APP_SITE_NAME", ""),
  SECRECT_KEY: read(
    "VITE_SECRECT_KEY",
    "REACT_APP_SECRECT_KEY",
    "local-dev-secret"
  ),
  GOOGLE_CLIENT_ID: read(
    "VITE_GOOGLE_CLIENT_ID",
    "REACT_APP_GOOGLE_CLIENT_ID",
    ""
  ),
  GOOGLE_REDIRECTURL: read(
    "VITE_GOOGLE_REDIRECTURL",
    "REACT_APP_GOOGLE_REDIRECTURL",
    ""
  ),
  FACEBOOK_APP_ID: read(
    "VITE_FACEBOOK_APP_ID",
    "REACT_APP_FACEBOOK_APP_ID",
    ""
  ),
  FACEBOOK_REDIRECTURL: read(
    "VITE_FACEBOOK_REDIRECTURL",
    "REACT_APP_FACEBOOK_REDIRECTURL",
    ""
  ),
  FRONT_END_BASE_URL: read(
    "VITE_FRONT_END_BASE_URL",
    "REACT_APP_FRONT_END_BASE_URL",
    ""
  ),
};

export default env;
