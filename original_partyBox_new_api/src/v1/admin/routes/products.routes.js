const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const { uploadImage, bulkUpload } = require("../middleware/upload.middleware");
const products = require("../controllers/products.controller");
const { fail } = require("../services/admin.helpers");

router.use(requireAdmin);

function requireNumericDealId(req, res, next) {
  const id = String(req.params.dealId || "");
  if (!/^\d+$/.test(id)) {
    return res.status(404).send(fail("Not found"));
  }
  return next();
}

router.get("/", products.listProducts);

/** Kept for compatibility — prefer /api/admin/product-bulk/* */
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

router.get("/:dealId", requireNumericDealId, products.getProduct);
router.post("/", products.createProduct);
router.put("/:dealId", requireNumericDealId, products.updateProduct);
router.put("/:dealId/status", requireNumericDealId, products.updateProductStatus);
router.post(
  "/:dealId/image",
  requireNumericDealId,
  uploadImage.single("image"),
  products.uploadProductImage
);
router.delete("/:dealId", requireNumericDealId, products.deleteProduct);

module.exports = router;
