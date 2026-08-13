const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const billing_infoSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    purchase_inv_id: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postal_code: { type: String, required: true },
    cardnumber: { type: String, required: true },
    expiry_month: { type: String, required: true },
    expiry_year: { type: String, required: true },
    cvv: { type: String, required: true },
    createddate: { type: Number, required: true },
  },
  {
    collection: "billing_info",
    timestamps: false,
  }
);

billing_infoSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("billing_info");
  }
  next();
});

module.exports = mongoose.models.billing_info || mongoose.model("billing_info", billing_infoSchema);
