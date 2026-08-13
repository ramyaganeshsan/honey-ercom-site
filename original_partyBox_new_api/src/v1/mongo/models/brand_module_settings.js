const mongoose = require("mongoose");

const brand_module_settingsSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    filter_product: { type: Number, required: true, default: 1 },
    brand_logo_product: { type: Number, required: true, default: 1 },
  },
  {
    collection: "brand_module_settings",
    timestamps: false,
  }
);

module.exports = mongoose.models.brand_module_settings || mongoose.model("brand_module_settings", brand_module_settingsSchema);
