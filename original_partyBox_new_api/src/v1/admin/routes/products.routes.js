const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const products = require("../controllers/products.controller");

router.use(requireAdmin);

router.get("/", products.listProducts);
router.get("/:dealId", products.getProduct);
router.post("/", products.createProduct);
router.put("/:dealId", products.updateProduct);
router.put("/:dealId/status", products.updateProductStatus);

module.exports = router;
