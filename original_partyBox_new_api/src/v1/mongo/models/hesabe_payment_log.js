const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const hesabe_payment_logSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    status: { type: Number, required: true },
    payment_token: { type: Number, required: true },
    payment_id: { type: String, required: true },
    paid_on: { type: String, required: true },
    method: { type: Number, required: true },
    cart_id: { type: Number, required: true },
    tabby_installment_count: { type: Number, required: true },
    tabby_installment_period: { type: String, required: true },
    tabby_payment_status: { type: String, required: true },
    tamara_payment_mode: { type: String, required: true },
    tamara_payment_status: { type: String, required: true },
    tamara_instalments_count: { type: Number, required: true },
  },
  {
    collection: "hesabe_payment_log",
    timestamps: false,
  }
);

hesabe_payment_logSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("hesabe_payment_log");
  }
  next();
});

module.exports = mongoose.models.hesabe_payment_log || mongoose.model("hesabe_payment_log", hesabe_payment_logSchema);
