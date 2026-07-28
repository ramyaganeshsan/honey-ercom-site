const express = require("express");
const cartRoutes = express.Router();
const { validateParams } = require("../middleware/auth.middleware");

const {
  updateCartSchema,
  addToCartSchema,
} = require("../validation/cart.validation");

const {
  getMyCartProducts,
  updateCart,
  addToCart,
} = require("../controller/cart.controller");

cartRoutes
  .route("/")
  .get(getMyCartProducts)
  .post(validateParams(addToCartSchema), addToCart)
  .put(validateParams(updateCartSchema), updateCart);

module.exports = cartRoutes;
