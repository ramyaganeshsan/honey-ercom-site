const express = require("express");
const userRouter = express.Router();
const { validateParams } = require("../middleware/auth.middleware");

const {
  getUserInfo,
  changePassword,
} = require("../controller/users.controller");

const { updateUserInfo } = require("../controller/users.controller");

const {
  updatePasswordSchema,
  userProfileSchema,
} = require("../validation/users.validation");

userRouter
  .route("/profile")
  .get(getUserInfo)
  .put(validateParams(userProfileSchema), updateUserInfo);

userRouter
  .route("/change_password")
  .put(validateParams(updatePasswordSchema), changePassword);

module.exports = userRouter;
