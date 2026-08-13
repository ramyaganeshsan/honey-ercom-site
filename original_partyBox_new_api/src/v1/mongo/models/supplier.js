const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const supplierSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    name: { type: String, required: true },
    name_ar: { type: String, required: true },
    status: { type: Number, required: true },
  },
  {
    collection: "supplier",
    timestamps: false,
  }
);

supplierSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("supplier");
  }
  next();
});

module.exports = mongoose.models.supplier || mongoose.model("supplier", supplierSchema);
