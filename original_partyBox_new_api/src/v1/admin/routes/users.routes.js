const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const users = require("../controllers/users.controller");

router.use(requireAdmin);

router.get("/", users.listUsers);
router.post("/admin", users.createAdminUser);
router.get("/:userId", users.getUser);
router.put("/:userId/status", users.updateUserStatus);

module.exports = router;
