const {
  getStatusCode,
  sortFilter,
  itemsPerPage,
  getMessage,
} = require("../utils");

const {
  getProducts,
  getMinMaxPrice,
  getCategoryWiseProductCount,
  getProductDetail,
  getRelatedProductsDetails,
  // getProductSizeDetails,
  getProductInCartDetails,
  getSubProductSizeAndQuantity,
  getOffersProducts,
} = require("../services/product.service");
const logger = require("../utils/logger");
const {
  PRODUCT_DISPLAY_IMAGE,
  NO_IMAGE_URL,
  NO_PROFILE_URL,
} = require("../utils/constants");

exports.getProducts = async (req, res, next) => {
  try {
    let products = await getProducts(req.query);
    res.send({
      status: getStatusCode("success"),
      message: "",
      data: products,
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};

exports.getProductFilters = async (req, res, next) => {
  try {
    let productMinMaxPrice = await getMinMaxPrice();
    let categoryWiseProductCount = await getCategoryWiseProductCount();

    let filters = {
      sortFilter,
      itemsPerPage,
      minimumPrice: productMinMaxPrice[0]?.minimumPrice,
      maximunPrice: productMinMaxPrice[0]?.maximunPrice,
      categoryWiseProductCount,
    };

    let data = filters;
    res.send({
      status: getStatusCode("success"),
      message: "",
      data,
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};

exports.getProductDetail = async (req, res, next) => {
  try {
    let { deal_key } = req.query;
    let productDetail = await getProductDetail(deal_key);

    if (
      productDetail &&
      Object.keys(productDetail).length > 0 &&
      !Object.is(productDetail["deal_title"], null)
    ) {
      productDetail["in_cart"] = await getProductInCartDetails(
        productDetail["deal_id"]
      );
      productDetail["image_url"] = PRODUCT_DISPLAY_IMAGE;
      productDetail["no_image_url"] = NO_IMAGE_URL;
      productDetail["no_profile_image"] = NO_PROFILE_URL;
      let promises = [null, null];

      let relatedProducts = productDetail["related_products"]
        ? productDetail["related_products"]
        : "";
      if (relatedProducts) {
        try {
          relatedProducts = JSON.parse(productDetail["related_products"]);
          if (Array.isArray(relatedProducts)) {
            promises[0] = getRelatedProductsDetails(
              relatedProducts,
              productDetail.deal_id
            );
          }
        } catch (err) {
          logger.error("Could not parse related products");
          logger.info(productDetail["related_products"]);
          console.log(err);
        }
      }

      if (productDetail["having_size_color"]) {
        promises[1] = getSubProductSizeAndQuantity(productDetail["deal_id"]);
      }

      /* 
        let sizeAndQuantity = productDetail["sizeAndQuantity"]
          ? productDetail["sizeAndQuantity"]
          : "";
        if (sizeAndQuantity) {
          try {
            sizeAndQuantity = JSON.parse(productDetail["sizeAndQuantity"]);
            if (
              Array.isArray(sizeAndQuantity) &&
              (sizeAndQuantity.length > 0 || sizeAndQuantity[0] != 0)
            ) {
              promises.push(
                getProductSizeDetails(sizeAndQuantity, productDetail["deal_id"])
              );
            }
          } catch (err) {
            logger.error("Could not parse related products");
            logger.info(productDetail["related_products"]);
            console.log(err);
          }
        }
      */

      let [relatedProductsResult, sizeAndQuantityResult] = await Promise.all(
        promises
      );

      // if (!sizeAndQuantity || sizeAndQuantity?.length <= 0) {
      //   throw new Error("Size and quantity not defined");
      // }

      if (sizeAndQuantityResult) {
        sizeAndQuantityResult.sort((a, b) => {
          const weightA = parseWeight(a.size_name);
          const weightB = parseWeight(b.size_name);
          return weightB - weightA;
        });
      }

      productDetail["related_products"] = relatedProductsResult ?? [];
      productDetail["sizeAndQuantity"] = sizeAndQuantityResult ?? [];

      res.send({
        status: getStatusCode("success"),
        message: "",
        data: productDetail,
      });
    } else {
      res.send({
        status: getStatusCode("failed"),
        message: getMessage("product_not_found", req.lang),
        data: {},
      });
    }
  } catch (err) {
    logger.error(err);
    console.log(err);
    next(err);
  }
};

function parseWeight(sizeString) {
  const numericPart = sizeString.match(/\d+/)[0];
  const unitPart = sizeString.match(/[a-zA-Z]+/)[0].toLowerCase();
  if (unitPart === "kg" || unitPart === "lt" || unitPart === "litre") {
    return parseFloat(numericPart) * 1000;
  } else if (
    unitPart === "g" ||
    unitPart === "gram" ||
    unitPart === "ml" ||
    unitPart === "millilitre"
  ) {
    return parseFloat(numericPart);
  } else {
    return 0;
  }
}

exports.getOffersProducts = async (req, res, next) => {
  try {
    let offerproducts = await getOffersProducts(req.query);
    res.send({
      status: getStatusCode("success"),
      message: "",
      data: offerproducts,
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};
