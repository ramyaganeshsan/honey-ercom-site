const mongoose = require("mongoose");

const dummy_transactionSchema = new mongoose.Schema(
  {
    order_id: { type: Number, required: true },
    payment_status: { type: Number, required: true, default: 1 },
    type: { type: Number, required: true, default: 1 },
    order_date: { type: Number, required: true },
    cart_id: { type: Number, required: true },
  },
  {
    collection: "dummy_transaction",
    timestamps: false,
  }
);

module.exports = mongoose.models.dummy_transaction || mongoose.model("dummy_transaction", dummy_transactionSchema);
