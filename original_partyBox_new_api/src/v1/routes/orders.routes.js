const express = require("express");
const ordersRoutes = express.Router();

const { validateParams } = require("../middleware/auth.middleware");
const { cancelOrderSchema } = require("../validation/orders.validation");
const {
  getMyOrdersList,
  cancelMyOrder,
  generateInvoicePdf,
  getOrderDetails,
} = require("../controller/orders.controller");

ordersRoutes.route("/").get(getMyOrdersList);
ordersRoutes
  .route("/cancel")
  .post(validateParams(cancelOrderSchema), cancelMyOrder);
ordersRoutes.route("/generate-invoice").post(generateInvoicePdf);
ordersRoutes.route("/order-details").post(getOrderDetails);

module.exports = ordersRoutes;
