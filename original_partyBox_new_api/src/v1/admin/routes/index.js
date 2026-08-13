const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth.routes"));
router.use("/dashboard", require("./dashboard.routes"));
router.use("/users", require("./users.routes"));
router.use("/categories", require("./categories.routes"));
router.use("/products", require("./products.routes"));
router.use("/orders", require("./orders.routes"));
router.use("/transactions", require("./transactions.routes"));
router.use("/promocodes", require("./promocodes.routes"));
router.use("/cms", require("./cms.routes"));
router.use("/banners", require("./banners.routes"));
router.use("/reviews", require("./reviews.routes"));
router.use("/settings", require("./settings.routes"));
router.use("/shipping", require("./shipping.routes"));
router.use("/contact", require("./contact.routes"));
router.use("/reports", require("./reports.routes"));

module.exports = router;
