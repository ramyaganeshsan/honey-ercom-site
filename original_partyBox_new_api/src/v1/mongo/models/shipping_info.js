const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const shipping_infoSchema = new mongoose.Schema(
  {
    shipping_id: { type: Number, required: false },
    shipping_type: { type: Number, required: true, default: 1 },
    transaction_id: { type: Number, required: true },
    tracking: { type: String, required: true },
    user_id: { type: Number, required: true },
    adderss1: { type: String, required: true },
    address2: { type: String, required: true },
    city: { type: Number, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    name: { type: String, required: true },
    postal_code: { type: Number, required: true },
    phone: { type: String, required: true },
    shipping_date: { type: String, required: true },
    delivery_status: { type: Number, required: true, default: 0 },
  },
  {
    collection: "shipping_info",
    timestamps: false,
  }
);

shipping_infoSchema.pre("save", async function (next) {
  if (this.shipping_id == null) {
    this.shipping_id = await getNextSequence("shipping_info");
  }
  next();
});

module.exports = mongoose.models.shipping_info || mongoose.model("shipping_info", shipping_infoSchema);
