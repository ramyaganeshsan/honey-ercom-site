const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const dashboard = require("../controllers/dashboard.controller");

router.get("/", requireAdmin, dashboard.getDashboard);

module.exports = router;
