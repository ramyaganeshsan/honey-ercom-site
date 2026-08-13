const mongoose = require("mongoose");

const view_count_location_bkupSchema = new mongoose.Schema(
  {
    view_id: { type: Number, required: true, default: 0 },
    deal_key: { type: String, required: true },
    product_key: { type: String, required: true },
    auction_key: { type: String, required: true },
    ip: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    date: { type: Number, required: true },
  },
  {
    collection: "view_count_location_bkup",
    timestamps: false,
  }
);

module.exports = mongoose.models.view_count_location_bkup || mongoose.model("view_count_location_bkup", view_count_location_bkupSchema);
