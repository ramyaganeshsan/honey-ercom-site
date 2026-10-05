const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const { bulkUpload } = require("../middleware/upload.middleware");
const products = require("../controllers/products.controller");

/**
 * Separate mount so /bulk-template never collides with /products/:dealId.
 * Paths: /api/admin/product-bulk/template , /api/admin/product-bulk/upload
 */
router.use(requireAdmin);

router.get("/template", products.downloadBulkTemplate);
router.post(
  "/upload",
  bulkUpload.fields([
    { name: "excel", maxCount: 1 },
    { name: "images_zip", maxCount: 1 },
  ]),
  products.bulkUploadProducts
);

module.exports = router;
