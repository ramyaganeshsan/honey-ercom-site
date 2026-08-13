const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const package_infoSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    purchase_inv_id: { type: String, required: true },
    package_type: { type: Number, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    subject: { type: String, required: true },
    product_id: { type: Number, required: true },
    subscription_cost: { type: Number, required: true },
    setup_cost: { type: Number, required: true },
    service_tax: { type: Number, required: true },
    service_tax_cost: { type: Number, required: true },
    amount: { type: Number, required: true },
    payment_terms: { type: Number, required: true },
    createddate: { type: Number, required: true },
    startdate: { type: Number, required: true },
    expirydate: { type: Number, required: true },
    paid_status: { type: Number, required: true },
    txnID: { type: String, required: true },
    ePGTxnID: { type: String, required: true },
    currency: { type: Number, required: true },
    responsecode: { type: String, required: true },
    response_msg: { type: String, required: true },
    pay_mode: { type: Number, required: true },
  },
  {
    collection: "package_info",
    timestamps: false,
  }
);

package_infoSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("package_info");
  }
  next();
});

module.exports = mongoose.models.package_info || mongoose.model("package_info", package_infoSchema);
