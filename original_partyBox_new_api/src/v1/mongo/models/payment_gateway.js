const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const payment_gatewaySchema = new mongoose.Schema(
  {
    payment_gateway_id: { type: Number, required: false },
    payment_gatway: { type: String, required: true },
    description: { type: String, required: true },
    payment_method: { type: String, required: true },
    payment_status: { type: String, required: true },
    default_payment_gateway: { type: Number, required: true },
    payment_gateway_username: { type: String, required: true },
    payment_gateway_password: { type: String, required: true },
    payment_gateway_signature: { type: String, required: true },
    live_payment_gateway_username: { type: String, required: true },
    live_payment_gateway_password: { type: String, required: true },
    live_payment_gateway_signature: { type: String, required: true },
    company_id: { type: Number, required: true },
  },
  {
    collection: "payment_gateway",
    timestamps: false,
  }
);

payment_gatewaySchema.pre("save", async function (next) {
  if (this.payment_gateway_id == null) {
    this.payment_gateway_id = await getNextSequence("payment_gateway");
  }
  next();
});

module.exports = mongoose.models.payment_gateway || mongoose.model("payment_gateway", payment_gatewaySchema);
