const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const reports = require("../controllers/reports.controller");

router.use(requireAdmin);

router.get("/sales", reports.salesSummary);
router.get("/", reports.salesSummary);

module.exports = router;
