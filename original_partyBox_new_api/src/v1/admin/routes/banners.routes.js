const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const banners = require("../controllers/banners.controller");

router.use(requireAdmin);

router.get("/", banners.listBanners);
router.get("/:bannerId", banners.getBanner);
router.post("/", banners.createBanner);
router.put("/:bannerId", banners.updateBanner);
router.delete("/:bannerId", banners.deleteBanner);

module.exports = router;
