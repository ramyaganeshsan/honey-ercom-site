const express = require("express");
const productRouter = express.Router();

const { validateParams } = require("../middleware/auth.middleware");

const {
  getProducts,
  getProductFilters,
  getProductDetail,
  getOffersProducts,
} = require("../controller/product.controller");
const {
  getProductsSchema,
  getProductDetailsSchema,
} = require("../validation/product.validation");

productRouter.get("/", validateParams(getProductsSchema), getProducts);
productRouter.get("/getFilters", getProductFilters);
productRouter.get(
  "/getProductDetails",
  validateParams(getProductDetailsSchema),
  getProductDetail
);
productRouter.get(
  "/promotions",
  validateParams(getProductsSchema),
  getOffersProducts
);

module.exports = productRouter;
