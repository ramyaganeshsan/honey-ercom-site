const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const settings = require("../controllers/settings.controller");

router.use(requireAdmin);

router.get("/", settings.getSettings);
router.put("/", settings.updateSettings);

module.exports = router;
