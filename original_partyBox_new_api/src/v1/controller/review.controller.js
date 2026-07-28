const { getStatusCode, getMessage } = require("../utils");
const logger = require("../utils/logger");

const { addReview, getReviews } = require("../services/review.services");

exports.addReview = async (req, res, next) => {
  try {
    let { body, userDetails } = req;
    let response = await addReview(body, userDetails);
    if (response && response?.id) {
      res.send({
        status: getStatusCode("success"),
        message: getMessage("review_added_successfully", req.lang),
      });
    } else {
      res.send({
        status: getStatusCode("failed"),
        message: getMessage("failed_to_add_review", req.lang),
      });
    }
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};

exports.getReviews = async (req, res, next) => {
  try {
    let { deal_id } = req.query;
    let { userDetails } = req;
    let response = await getReviews(deal_id, userDetails?.user_id ?? "");
    res.send(response);
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};
