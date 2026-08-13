const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const product_sizeSchema = new mongoose.Schema(
  {
    product_size_id: { type: Number, required: false },
    deal_id: { type: Number, required: true },
    size_name: { type: String, required: true },
    quantity: { type: Number, required: true },
    size_id: { type: Number, required: true },
    size_ids: { type: String, required: true },
  },
  {
    collection: "product_size",
    timestamps: false,
  }
);

product_sizeSchema.pre("save", async function (next) {
  if (this.product_size_id == null) {
    this.product_size_id = await getNextSequence("product_size");
  }
  next();
});

module.exports = mongoose.models.product_size || mongoose.model("product_size", product_sizeSchema);
