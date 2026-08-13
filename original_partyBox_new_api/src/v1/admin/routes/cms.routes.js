const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const cms = require("../controllers/cms.controller");

router.use(requireAdmin);

router.get("/", cms.listCms);
router.get("/:cmsId", cms.getCms);
router.post("/", cms.createCms);
router.put("/:cmsId", cms.updateCms);
router.delete("/:cmsId", cms.deleteCms);

module.exports = router;
