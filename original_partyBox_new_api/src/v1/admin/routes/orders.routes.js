const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const orders = require("../controllers/orders.controller");

router.use(requireAdmin);

router.get("/", orders.listOrders);
router.get("/:id", orders.getOrder);
router.put("/:id/status", orders.updateOrderStatus);
router.put("/:id", orders.updateOrderStatus);

module.exports = router;
