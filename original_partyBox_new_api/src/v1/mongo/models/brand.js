const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const brandSchema = new mongoose.Schema(
  {
    brand_id: { type: Number, required: false },
    brand_name: { type: String, required: true },
    brand_name_french: { type: String, required: true },
    brand_url: { type: String, required: true },
    brand_description: { type: String, required: true },
    brand_description_french: { type: String, required: true },
    brand_status: { type: Number, required: true, default: 1 },
    created_date: { type: Date, required: true },
    updated_date: { type: Date, default: "0000-00-00 00:00:00" },
    brand_deal: { type: Number, required: true },
    brand_product: { type: Number, required: true },
    brand_auction: { type: Number, required: true },
  },
  {
    collection: "brand",
    timestamps: false,
  }
);

brandSchema.pre("save", async function (next) {
  if (this.brand_id == null) {
    this.brand_id = await getNextSequence("brand");
  }
  next();
});

module.exports = mongoose.models.brand || mongoose.model("brand", brandSchema);
