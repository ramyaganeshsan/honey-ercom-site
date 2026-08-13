const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const product_policySchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    product_id: { type: Number, required: true },
    text: { type: String, required: true },
  },
  {
    collection: "product_policy",
    timestamps: false,
  }
);

product_policySchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("product_policy");
  }
  next();
});

module.exports = mongoose.models.product_policy || mongoose.model("product_policy", product_policySchema);
