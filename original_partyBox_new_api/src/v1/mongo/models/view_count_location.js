const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const view_count_locationSchema = new mongoose.Schema(
  {
    view_id: { type: Number, required: false },
    deal_key: { type: String, required: true },
    product_key: { type: String, required: true },
    auction_key: { type: String, required: true },
    ip: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    date: { type: Number, required: true },
  },
  {
    collection: "view_count_location",
    timestamps: false,
  }
);

view_count_locationSchema.pre("save", async function (next) {
  if (this.view_id == null) {
    this.view_id = await getNextSequence("view_count_location");
  }
  next();
});

module.exports = mongoose.models.view_count_location || mongoose.model("view_count_location", view_count_locationSchema);
