const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const request_fundSchema = new mongoose.Schema(
  {
    request_id: { type: Number, required: false },
    type: { type: Number, required: true },
    user_id: { type: Number, required: true },
    payment_comments: { type: String, required: true },
    amount: { type: Number, required: true },
    date_time: { type: Number, required: true },
    request_status: { type: Number, required: true, default: 1 },
    payment_status: { type: Number, required: true, default: 0 },
    transaction_date: { type: Number, required: true },
    transaction_id: { type: String, required: true },
    error_code: { type: String, required: true },
    error_title: { type: String, required: true },
    error_message: { type: String, required: true },
  },
  {
    collection: "request_fund",
    timestamps: false,
  }
);

request_fundSchema.pre("save", async function (next) {
  if (this.request_id == null) {
    this.request_id = await getNextSequence("request_fund");
  }
  next();
});

module.exports = mongoose.models.request_fund || mongoose.model("request_fund", request_fundSchema);
