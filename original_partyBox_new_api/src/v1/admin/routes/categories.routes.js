const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const categories = require("../controllers/categories.controller");

router.use(requireAdmin);

router.get("/", categories.listCategories);
router.get("/:categoryId", categories.getCategory);
router.post("/", categories.createCategory);
router.put("/:categoryId", categories.updateCategory);
router.delete("/:categoryId", categories.deleteCategory);

module.exports = router;
