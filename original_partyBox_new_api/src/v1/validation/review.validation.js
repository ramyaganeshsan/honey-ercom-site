const JOI = require("joi");

exports.addReviewSchema = {
  body: JOI.object().keys({
    rating: JOI.number()
      .required()
      .valid("1", "2", "3", "4", "5", 1, 2, 3, 4, 5)
      .label("Rating"),
    review_title: JOI.string().required().max(50).label("Title"),
    review_description: JOI.string().required().max(250).label("Description"),
    type_id: JOI.number().required().label("Type"),
  }),
};

exports.getReviewsSchema = {
  query: JOI.object().keys({
    deal_id: JOI.string().required().label("Product ID"),
    pageNumber: JOI.number().allow(null, "").label("Page number"),
    pageSize: JOI.number().allow(null, "").label("Page size"),
  }),
};
