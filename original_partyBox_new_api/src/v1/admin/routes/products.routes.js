const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const { uploadImage, bulkUpload } = require("../middleware/upload.middleware");
const products = require("../controllers/products.controller");

router.use(requireAdmin);

router.get("/", products.listProducts);
/** Static paths before /:dealId */
router.get("/bulk-template", products.downloadBulkTemplate);
router.post(
  "/bulk",
  bulkUpload.fields([
    { name: "excel", maxCount: 1 },
    { name: "images_zip", maxCount: 1 },
  ]),
  products.bulkUploadProducts
);
router.get("/:dealId", products.getProduct);
router.post("/", products.createProduct);
router.put("/:dealId", products.updateProduct);
router.put("/:dealId/status", products.updateProductStatus);
router.post(
  "/:dealId/image",
  uploadImage.single("image"),
  products.uploadProductImage
);
router.delete("/:dealId", products.deleteProduct);

module.exports = router;
