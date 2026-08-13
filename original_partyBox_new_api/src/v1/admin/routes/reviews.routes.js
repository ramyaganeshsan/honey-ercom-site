const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const reviews = require("../controllers/reviews.controller");

router.use(requireAdmin);

router.get("/", reviews.listReviews);
router.get("/:id", reviews.getReview);
router.put("/:id/status", reviews.updateReviewStatus);
router.put("/:id", reviews.updateReviewStatus);
router.delete("/:id", reviews.deleteReview);

module.exports = router;
