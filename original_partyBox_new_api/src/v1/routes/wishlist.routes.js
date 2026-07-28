const express = require("express");
const userRouter = express.Router();
const { validateParams } = require("../middleware/auth.middleware");

const {
  addToWishListSchema,
  deleteFromWishListSchema,
} = require("../validation/wishlist.validation");

const {
  getWishList,
  addToWishList,
  removeFromWishList,
} = require("../controller/wishlist.controller");

userRouter
  .route("/")
  .get(getWishList)
  .post(validateParams(addToWishListSchema), addToWishList)
  .delete(validateParams(deleteFromWishListSchema), removeFromWishList);

module.exports = userRouter;
