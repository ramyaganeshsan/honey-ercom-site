const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const package_account_transactionSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    invoice_ref_id: { type: Number, required: true },
    business_name: { type: String, required: true },
    package_type: { type: Number, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postal_code: { type: String, required: true },
    address: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: Number, required: true },
    subscription_cost: { type: Number, required: true },
    setup_cost: { type: Number, required: true },
    service_tax: { type: Number, required: true },
    service_tax_cost: { type: Number, required: true },
    amount: { type: Number, required: true },
    payment_terms: { type: Number, required: true },
    createddate: { type: Number, required: true },
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
    collection: "package_account_transaction",
    timestamps: false,
  }
);

package_account_transactionSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("package_account_transaction");
  }
  next();
});

module.exports = mongoose.models.package_account_transaction || mongoose.model("package_account_transaction", package_account_transactionSchema);
