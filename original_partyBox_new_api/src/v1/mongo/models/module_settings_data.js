const mongoose = require("mongoose");

const module_settings_dataSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    module_name: { type: String, required: true },
    account_id: { type: String, required: true },
    api_password: { type: String, required: true },
    api_signature: { type: String, required: true },
    transaction_key: { type: String, required: true },
    api_id: { type: String, required: true },
    payment_mode: { type: Number, required: true },
    module_status: { type: Number, required: true, default: 1 },
    module_type: { type: Number, required: true, default: 1 },
    module_date: { type: String, required: true },
  },
  {
    collection: "module_settings_data",
    timestamps: false,
  }
);

module.exports = mongoose.models.module_settings_data || mongoose.model("module_settings_data", module_settings_dataSchema);
