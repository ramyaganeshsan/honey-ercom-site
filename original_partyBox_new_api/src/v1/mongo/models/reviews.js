const mongoose = require("mongoose");

const reviewsSchema = new mongoose.Schema(
  {
    review_id: { type: Number, required: true },
    user_id: { type: Number, required: true },
    product_id: { type: Number, required: true },
    review_title: { type: String, required: true },
    review_description: { type: String, required: true },
    created_date: { type: Number, required: true },
  },
  {
    collection: "reviews",
    timestamps: false,
  }
);

module.exports = mongoose.models.reviews || mongoose.model("reviews", reviewsSchema);
