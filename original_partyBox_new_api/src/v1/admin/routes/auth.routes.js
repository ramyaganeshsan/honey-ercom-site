const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const auth = require("../controllers/auth.controller");

router.post("/login", auth.login);
router.get("/me", requireAdmin, auth.me);

module.exports = router;
