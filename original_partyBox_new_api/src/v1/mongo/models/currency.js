const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema(
  {
    currency_id: { type: Number, required: true },
    currency_name: { type: String, required: true },
    currency_code: { type: String, required: true },
    currency_symbol: { type: String, required: true },
    currency_status: { type: Number, required: true },
    currency_default: { type: Number, required: true },
  },
  {
    collection: "currency",
    timestamps: false,
  }
);

module.exports = mongoose.models.currency || mongoose.model("currency", currencySchema);
