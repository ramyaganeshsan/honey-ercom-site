const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const promocodes = require("../controllers/promocodes.controller");

router.use(requireAdmin);

router.get("/", promocodes.listPromocodes);
router.get("/:id", promocodes.getPromocode);
router.post("/", promocodes.createPromocode);
router.put("/:id", promocodes.updatePromocode);
router.delete("/:id", promocodes.deletePromocode);

module.exports = router;
