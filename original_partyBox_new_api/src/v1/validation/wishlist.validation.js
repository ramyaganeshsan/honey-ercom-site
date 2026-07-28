const JOI = require("joi");

exports.addToWishListSchema = {
  body: JOI.object().keys({
    productId: JOI.number().integer().required().label("Product ID"),
  }),
};

exports.deleteFromWishListSchema = {
  body: JOI.object().keys({
    productId: JOI.number().integer().required().label("Product ID"),
  }),
};
