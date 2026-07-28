var CryptoJS = require("crypto-js");
var base64 = require("base-64");
var dayjs = require("dayjs");

const toastConfiguration = {
  position: "top-center",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

exports.toastConfig = toastConfiguration;

exports.encrypteString = (string) => {
  var encryptedData = CryptoJS.AES.encrypt(
    string,
    process.env.REACT_APP_SECRECT_KEY
  ).toString();
  return encryptedData;
};

const decrypteString = (string) => {
  var decryptBytes = CryptoJS.AES.decrypt(
    string,
    process.env.REACT_APP_SECRECT_KEY
  );
  var decryptData = decryptBytes.toString(CryptoJS.enc.Utf8);
  return decryptData;
};

exports.decrypteData = (string) => {
  if (!string) return {};

  try {
    return JSON.parse(decrypteString(string));
  } catch (err) {
    console.log(err);
    return {};
  }
};

exports.getUserInfo = () => {
  let userDetails = localStorage.getItem("user_details");
  return userDetails ? JSON.parse(decrypteString(userDetails)) : {};
};

exports.getToken = () => {
  let userDetails = localStorage.getItem("user_details");
  if (userDetails) {
    userDetails = JSON.parse(decrypteString(userDetails));
    return userDetails?.token ? `Bearer ${userDetails.token}` : "";
  }
  return "";
};

exports.getSessionID = () => {
  let sessionID = localStorage.getItem("sessionID");
  if (sessionID) {
    return sessionID;
  }
  return "";
};

exports.setSessionID = (sessionID) => {
  if (
    sessionID &&
    sessionID !== "" &&
    localStorage.getItem("sessionID") !== sessionID
  ) {
    localStorage.setItem("sessionID", sessionID);
  }
};

exports.removeSessionID = () => {
  localStorage.removeItem("sessionID");
};

exports.handleResponse = (response, toast, navigate, refetch = null) => {
  let status = Number(response?.status) ?? "";
  if (status === "" && status !== 0) return;

  let message = response?.message;
  if (status === 0 || status === -2) {
    toast.error(message, toastConfiguration);
  } else if (status === -1) {
    // localStorage.clear();
    message = message ? message : "Your token got expired";
    toast.error(message, toastConfiguration);
    localStorage.removeItem("user_details");
    navigate("/");
    // window.location.reload();
  } else if (status === -10) {
    toast.error(message, toastConfiguration);
    navigate("/");
  } else if (status === 3) {
    localStorage.removeItem("sessionID");
    toast.error(message, toastConfiguration);
    navigate("/");
    if (refetch) {
      refetch();
    }
  } else {
    toast.info(message, toastConfiguration);
  }
};

exports.objectToFormData = (values) => {
  var formData = new FormData();
  for (var key in values) {
    let data = values[key];
    if (
      typeof values[key] === "object" &&
      !Array.isArray(values[key]) &&
      values[key] !== null
    ) {
      let isFile = values[key] instanceof File;
      if (!isFile) {
        data = JSON.stringify(values[key]);
      }
    }
    formData.append(key, data);
  }
  return formData;
};

exports.getDate = () => {
  var today = new Date();
  return today.getDate();
};

exports.getUrl = (url) => {
  return `${process.env.REACT_APP_BASE_URL}${url}`;
};

/* 
  const changeLinkToSpan = (id) => {
    let navElement = document.getElementById(id);
    let newElement = document.createElement("span");

    if (navElement) {
      newElement.classList = [...navElement.classList, "active"];
      newElement.innerHTML = navElement.innerText;
      document.body.replaceChild(newElement, navElement);
    }
  };
*/

exports.changeActiveLink = (pathName) => {
  const navElements = document.querySelectorAll(".nav_link_top_bar");
  if (navElements) {
    navElements?.forEach((element) => {
      if (element && element?.classList?.contains("active")) {
        element?.classList?.remove("active");
      }
    });
  }

  if (pathName.includes("new_arrivals")) {
    let navElement = document.getElementById("new_arrivals_link");
    if (navElement) {
      if (!navElement.classList.contains("active")) {
        navElement.classList.add("active");
      }
    }
  }
  if (pathName === "/" || pathName === "home") {
    let navElement = document.getElementById("home_link");
    if (navElement) {
      if (!navElement.classList.contains("active")) {
        navElement.classList.add("active");
      }
    }
  }
  if (pathName.includes("products") || pathName.includes("product_detail")) {
    let navElement = document.getElementById("products_link");
    if (navElement) {
      if (!navElement.classList.contains("active")) {
        navElement.classList.add("active");
      }
    }
  }

  console.log(pathName);

  if (pathName.includes("promotions")) {
    let navElement = document.getElementById("promotions_link");
    if (navElement) {
      if (!navElement.classList.contains("active")) {
        navElement.classList.add("active");
      }
    }
  }
  if (pathName.includes("about_us")) {
    let navElement = document.getElementById("about_us_link");
    if (navElement) {
      if (!navElement.classList.contains("active")) {
        navElement.classList.add("active");
      }
    }
  }
  if (pathName.includes("contact_us")) {
    let navElement = document.getElementById("contact_us_link");
    if (navElement) {
      if (!navElement.classList.contains("active")) {
        navElement.classList.add("active");
      }
    }
  }
};

exports.encrypteQueryData = (string) => {
  if (!string) return "";
  try {
    return base64.encode(string);
  } catch (err) {
    console.log(err);
    return {};
  }
};

exports.decrypteQueryData = (string) => {
  if (!string) return {};
  try {
    return JSON.parse(base64.decode(string));
  } catch (err) {
    console.log(err);
    return {};
  }
};

exports.convertJSONToQueryString = (filters) => {
  if (!filters) return "";
  try {
    var queryString = Object.keys(filters)
      .map((key) => key + "=" + filters[key])
      .join("&");
    return typeof queryString !== "string" ? "" : queryString;
  } catch (err) {
    return "";
  }
};

exports.productFilters = {
  max: "",
  name: "",
  rate_review: "",
  m_c: "",
  s_c: "",
  sl_c: "",
  pageSize: 20,
  sort_by: "",
  refetch_data: true,
};

exports.convertTimestampToDate = (timestamp, dateTimeFormat) => {
  return dayjs.unix(timestamp).format(dateTimeFormat);
};

const discountCalculator = (type, discount, total) => {
  let totalDiscount = discount;
  if (Number(type) === 1) {
    totalDiscount = (Number(total) * Number(discount)) / 100;
  }
  return isNaN(totalDiscount) ? 0 : totalDiscount;
};

exports.calculateDiscount = (type = 1, discount, total = 0) => {
  /* 
    1 -> Percentage,
    0 -> Flat
  */

  let totalDiscount = discountCalculator(type, discount, total);
  return totalDiscount;
};

exports.calculateProductTotalPrice = (
  productDetails,
  shippingCost = 0,
  discountType = 0,
  isValidPromocode = false,
  discount = 0,
  tax = 0
) => {
  console.log(
    productDetails,
    shippingCost,
    discountType,
    isValidPromocode,
    discount,
    tax
  );

  let totalWithShipping = 0;
  let totalWithoutShipping = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  let productDetailsWithPrice = [];

  productDetails.forEach((product) => {
    let currentPrice = !isNaN(product.currentPrice) ? product.currentPrice : 0;
    let quantity = !isNaN(product.item_quantity) ? product.item_quantity : 0;
    let totalPrice = Number(currentPrice) * Number(quantity);
    totalWithoutShipping += Number(totalPrice);

    // let details = {
    //   ...product,
    //   totalPrice: totalPrice,
    // };
    let details = Object.assign({}, product);
    details["totalPrice"] = totalPrice;

    productDetailsWithPrice.push(details);
  });

  if (isValidPromocode) {
    totalDiscount = discountCalculator(
      discountType,
      discount,
      totalWithoutShipping
    );
    totalWithoutShipping =
      totalDiscount >= totalWithoutShipping
        ? 0
        : (totalWithoutShipping -= Number(totalDiscount));
  }

  totalWithShipping = Number(totalWithoutShipping) + Number(shippingCost);

  if (tax && tax > 0) {
    totalTax = discountCalculator(1, tax, totalWithoutShipping);
    totalWithShipping += Number(totalTax);
  }

  console.log({
    totalDiscount,
    totalWithShipping,
    totalWithoutShipping,
    products: productDetailsWithPrice,
    totalTax,
  });

  return {
    totalDiscount,
    totalWithShipping,
    totalWithoutShipping,
    products: productDetailsWithPrice,
    totalTax,
  };
};

exports.currencyFormatter = (totalAmount, currency = "UAD") => {
  let formatter = new Intl.NumberFormat("en-US", {
    currency: currency,
  });
  return formatter.format(totalAmount);
};

exports.updateCartItemsBatch = (totalCartItems, id = "cartCount") => {
  let cartCountElement = document.getElementById(id);
  if (cartCountElement) {
    if ((totalCartItems && !isNaN(totalCartItems)) || totalCartItems === 0) {
      cartCountElement.innerHTML = totalCartItems;
    }
  }
};

exports.updateWishlistItemsBatch = (
  totalWishlistItems,
  id = "wishlistCount"
) => {
  let cartCountElement = document.getElementById(id);
  if (cartCountElement) {
    if (
      (totalWishlistItems && !isNaN(totalWishlistItems)) ||
      totalWishlistItems === 0
    ) {
      cartCountElement.innerHTML = totalWishlistItems;
    }
  }
};

exports.getLanguage = () => {
  let language = localStorage.getItem("lang");
  if ((language && language === "en") || language === "ar") {
    return language;
  }
  return "en";
};

exports.setLanguage = (language) => {
  localStorage.setItem("lang", language?.toLowerCase());
};

exports.getWordBasedOnLanguage = (englishWord, arabicWord) => {
  let language = localStorage.getItem("lang");
  if (!language || (language !== "ar" && language !== "en")) {
    language = "en";
  }

  if (language === "en") {
    return englishWord;
  }

  if (language === "ar" && arabicWord && arabicWord !== "") {
    return arabicWord;
  }

  return englishWord;
};

exports.getPageDirection = () => {
  let language = localStorage.getItem("lang");
  if (!language || (language !== "ar" && language !== "en")) {
    language = "en";
  }

  if (language === "en") {
    return "ltr";
  }

  if (language === "ar") {
    return "rtl";
  }
};

exports.checkProductIsAlreadyWishlisted = (wishList, productId) => {
  if (wishList && Array.isArray(wishList) && wishList.includes(productId)) {
    return true;
  }
  return false;
};

/**
 * Prefer local/public assets when remote CDN/API certs fail (local demo).
 * Also fixes accidental `/public/public/` path doubling.
 */
exports.resolveAssetUrl = (url, fallbackPath = "/images/no_image_available.png") => {
  if (!url || typeof url !== "string") return fallbackPath;

  let resolved = url.replace(/\/public\/public\//gi, "/public/");

  const assetsBase = (process.env.REACT_APP_ASSETS_URL || "").replace(/\/$/, "");
  const knownBrokenHosts = [
    "https://api.thunyanhoneyuae.com",
    "http://api.thunyanhoneyuae.com",
    "https://www.thunyanhoneyuae.com",
  ];

  for (const host of knownBrokenHosts) {
    if (resolved.startsWith(host)) {
      const path = resolved.slice(host.length);
      // If assetsBase already ends with /public, strip leading /public from path
      let nextPath = path.startsWith("/") ? path : `/${path}`;
      if (assetsBase.endsWith("/public") && nextPath.startsWith("/public/")) {
        nextPath = nextPath.slice("/public".length);
      }
      resolved = assetsBase
        ? `${assetsBase}${nextPath}`
        : `http://localhost:5000${nextPath.startsWith("/public") ? nextPath : `/public${nextPath}`}`;
      break;
    }
  }

  // Map API public image paths to UI public fallbacks when useful
  try {
    const parsed = new URL(resolved, "http://localhost:3000");
    if (parsed.pathname.includes("/images/")) {
      const fileName = parsed.pathname.split("/").pop();
      if (fileName && !resolved.includes("localhost:5000") && !assetsBase) {
        // keep resolved
      }
    }
  } catch (e) {
    return fallbackPath;
  }

  return resolved || fallbackPath;
};

exports.handleAssetImageError = (event, fallbackPath = "/images/no_image_available.png") => {
  if (!event?.currentTarget) return;
  const current = event.currentTarget.src || "";
  event.currentTarget.onerror = null;

  // Prefer matching local public image by filename
  try {
    const fileName = current.split("/").pop()?.split("?")[0];
    if (fileName) {
      event.currentTarget.src = `/images/${fileName}`;
      return;
    }
  } catch (e) {
    // ignore
  }

  event.currentTarget.src = fallbackPath;
};

