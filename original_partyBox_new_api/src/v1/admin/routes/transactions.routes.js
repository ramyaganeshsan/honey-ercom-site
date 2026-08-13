const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const transactions = require("../controllers/transactions.controller");

router.use(requireAdmin);

router.get("/", transactions.listTransactions);
router.get("/:id", transactions.getTransaction);
router.put("/:id", transactions.updateTransaction);

module.exports = router;
