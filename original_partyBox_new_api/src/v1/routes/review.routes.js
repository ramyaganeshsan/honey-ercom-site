const Express = require("express");
const ratingsRoutes = Express.Router();

const { validateParams } = require("../middleware/auth.middleware");
const {
  addReviewSchema,
  getReviewsSchema,
} = require("../validation/review.validation");
const { addReview, getReviews } = require("../controller/review.controller");

ratingsRoutes
  .route("/")
  .get(validateParams(getReviewsSchema), getReviews)
  .post(validateParams(addReviewSchema), addReview);

module.exports = ratingsRoutes;
