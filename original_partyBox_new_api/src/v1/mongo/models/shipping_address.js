const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const shipping_addressSchema = new mongoose.Schema(
  {
    shipping_id: { type: Number, required: false },
    user_id: { type: Number, required: true },
    ship_name: { type: String, required: true },
    ship_mobileno: { type: String, required: true },
    ship_address1: { type: String, required: true },
    ship_address2: { type: String, required: true },
    ship_city: { type: Number, required: true },
    ship_state: { type: String, required: true },
    ship_country: { type: Number, required: true },
    ship_zipcode: { type: Number, required: true },
    ship_default: { type: Boolean, required: true, default: false },
    created_date: { type: String, required: true },
    altphone: { type: String, required: true },
    landmark: { type: String, required: true },
  },
  {
    collection: "shipping_address",
    timestamps: false,
  }
);

shipping_addressSchema.pre("save", async function (next) {
  if (this.shipping_id == null) {
    this.shipping_id = await getNextSequence("shipping_address");
  }
  next();
});

module.exports = mongoose.models.shipping_address || mongoose.model("shipping_address", shipping_addressSchema);
