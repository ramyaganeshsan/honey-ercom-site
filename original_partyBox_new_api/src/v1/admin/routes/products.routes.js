const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const { uploadImage, bulkUpload } = require("../middleware/upload.middleware");
const products = require("../controllers/products.controller");

router.use(requireAdmin);

router.get("/", products.listProducts);

/** Bulk upload helpers — must stay above /:dealId */
router.get("/bulk-template", products.downloadBulkTemplate);
router.get("/bulk/template", products.downloadBulkTemplate);
router.post(
  "/bulk",
  bulkUpload.fields([
    { name: "excel", maxCount: 1 },
    { name: "images_zip", maxCount: 1 },
  ]),
  products.bulkUploadProducts
);

/** Numeric deal_id only — prevents /bulk-template matching getProduct */
router.get("/:dealId(\\d+)", products.getProduct);
router.post("/", products.createProduct);
router.put("/:dealId(\\d+)", products.updateProduct);
router.put("/:dealId(\\d+)/status", products.updateProductStatus);
router.post(
  "/:dealId(\\d+)/image",
  uploadImage.single("image"),
  products.uploadProductImage
);
router.delete("/:dealId(\\d+)", products.deleteProduct);

module.exports = router;
