const mongoose = require("mongoose");

const brand_productSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    brand_id: { type: Number, required: true },
    brand_productid: { type: Number, required: true },
    brand_categoryid: { type: Number, required: true },
    brand_sub_categoryid: { type: Number, required: true },
    type: { type: Number, required: true },
  },
  {
    collection: "brand_product",
    timestamps: false,
  }
);

module.exports = mongoose.models.brand_product || mongoose.model("brand_product", brand_productSchema);
