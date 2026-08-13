const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const transaction_mappingSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    deal_id: { type: Number, required: true },
    product_id: { type: Number, required: true },
    auction_id: { type: Number, required: true },
    user_id: { type: Number, required: true },
    transaction_id: { type: String, required: true },
    coupon_code: { type: String, required: true },
    transaction_date: { type: Number, required: true },
    coupon_code_status: { type: Number, required: true, default: 1 },
    friend_name: { type: String, required: true },
    friend_email: { type: String, required: true },
    product_size: { type: Number, required: true },
    product_color: { type: Number, required: true },
    coupen_apply: { type: Number, required: true, default: 0 },
    coupon_amount: { type: Number, required: true, default: 0 },
    wallet_apply: { type: Number, required: true, default: 0 },
    wallet_amount: { type: String, required: true, default: "" },
  },
  {
    collection: "transaction_mapping",
    timestamps: false,
  }
);

transaction_mappingSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("transaction_mapping");
  }
  next();
});

module.exports = mongoose.models.transaction_mapping || mongoose.model("transaction_mapping", transaction_mappingSchema);
