const express = require("express");
const cronRoutes = express.Router();

const {
  productOutOfStockNotification,
} = require("../controller/cron.controller");

cronRoutes.get("/productOutOfStockNotification", productOutOfStockNotification);

module.exports = cronRoutes;
