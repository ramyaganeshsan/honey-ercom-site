const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const rate_reviewSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    rating: { type: Number, required: true },
    type_id: { type: Number, required: true },
    module_id: { type: Number, required: true },
    user_id: { type: Number, required: true },
    review_title: { type: String, required: true },
    review_description: { type: String, required: true },
    approve_status: { type: Boolean, required: true, default: false },
    approved_user_id: { type: Number, required: true },
    created_date: { type: Number, required: true },
  },
  {
    collection: "rate_review",
    timestamps: false,
  }
);

rate_reviewSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("rate_review");
  }
  next();
});

module.exports = mongoose.models.rate_review || mongoose.model("rate_review", rate_reviewSchema);
