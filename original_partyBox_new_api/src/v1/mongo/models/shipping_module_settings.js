const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const shipping_module_settingsSchema = new mongoose.Schema(
  {
    ship_module_id: { type: Number, required: false },
    ship_user_id: { type: Number, required: true },
    free: { type: Number, required: true, default: 1 },
    flat: { type: Number, required: true, default: 1 },
    per_product: { type: Number, required: true, default: 1 },
    per_quantity: { type: Number, required: true, default: 1 },
    aramex: { type: Number, required: true, default: 1 },
  },
  {
    collection: "shipping_module_settings",
    timestamps: false,
  }
);

shipping_module_settingsSchema.pre("save", async function (next) {
  if (this.ship_module_id == null) {
    this.ship_module_id = await getNextSequence("shipping_module_settings");
  }
  next();
});

module.exports = mongoose.models.shipping_module_settings || mongoose.model("shipping_module_settings", shipping_module_settingsSchema);
