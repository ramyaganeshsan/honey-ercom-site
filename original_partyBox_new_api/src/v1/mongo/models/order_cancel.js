const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const order_cancelSchema = new mongoose.Schema(
  {
    order_cancel_id: { type: Number, required: false },
    product_id: { type: Number, required: true },
    user_id: { type: Number, required: true },
    transaction_id: { type: Number, required: true },
    cart_id: { type: Number, required: true },
    cart_item_id: { type: Number, required: true },
    quantity: { type: String, required: true },
    amount: { type: String, required: true },
    reason: { type: String, required: true },
    cancel_process: { type: Number, required: true },
    process_type: { type: Number, required: true, default: 0 },
    cancel_approved_by: { type: Number, required: true },
    cancel_type: { type: Number, required: true },
    cancel_status: { type: Number, required: true, default: 0 },
    cancelled_on: { type: Number, required: true },
    payment_type: { type: Number, required: true },
  },
  {
    collection: "order_cancel",
    timestamps: false,
  }
);

order_cancelSchema.pre("save", async function (next) {
  if (this.order_cancel_id == null) {
    this.order_cancel_id = await getNextSequence("order_cancel");
  }
  next();
});

module.exports = mongoose.models.order_cancel || mongoose.model("order_cancel", order_cancelSchema);
