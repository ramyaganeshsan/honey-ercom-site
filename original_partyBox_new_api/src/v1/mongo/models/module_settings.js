const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const module_settingsSchema = new mongoose.Schema(
  {
    module_id: { type: Number, required: false },
    is_product: { type: Number, required: true },
    is_paypal: { type: Number, required: true, default: 1 },
    is_credit_card: { type: Number, required: true, default: 1 },
    is_authorize: { type: Number, required: true, default: 1 },
    is_cash_on_delivery: { type: Number, required: true },
    is_shipping: { type: Number, required: true },
    is_map: { type: Number, required: true },
    is_store_list: { type: Number, required: true },
    is_faq: { type: Number, required: true },
    is_city: { type: Number, required: true },
    is_cms: { type: Number, required: true },
    is_newsletter: { type: Number, required: true },
    free_shipping: { type: Number, required: true },
    flat_shipping: { type: Number, required: true },
    per_product: { type: Number, required: true },
    per_quantity: { type: Number, required: true },
    is_wallet: { type: Number, required: true },
    is_refund: { type: Number, required: true },
  },
  {
    collection: "module_settings",
    timestamps: false,
  }
);

module_settingsSchema.pre("save", async function (next) {
  if (this.module_id == null) {
    this.module_id = await getNextSequence("module_settings");
  }
  next();
});

module.exports = mongoose.models.module_settings || mongoose.model("module_settings", module_settingsSchema);
