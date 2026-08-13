const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const view_count_locationbkupdec10Schema = new mongoose.Schema(
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
    collection: "view_count_locationbkupdec10",
    timestamps: false,
  }
);

view_count_locationbkupdec10Schema.pre("save", async function (next) {
  if (this.view_id == null) {
    this.view_id = await getNextSequence("view_count_locationbkupdec10");
  }
  next();
});

module.exports = mongoose.models.view_count_locationbkupdec10 || mongoose.model("view_count_locationbkupdec10", view_count_locationbkupdec10Schema);
