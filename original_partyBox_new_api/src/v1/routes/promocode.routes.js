const express = require("express");
const promocodeRoutes = express.Router();
const { validateParams } = require("../middleware/auth.middleware");
const {
  validatePromocodeSchema,
} = require("../validation/promocode.validation");
const { validatePromocode } = require("../controller/promocode.controller");

promocodeRoutes
  .route("/")
  .post(validateParams(validatePromocodeSchema), validatePromocode);

module.exports = promocodeRoutes;
