const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const delivery_typesSchema = new mongoose.Schema(
  {
    Did: { type: Number, required: false },
    Dname: { type: String, required: true },
    Dname_french: { type: String, required: true },
    Ddays: { type: String, required: true },
    terms_and_condition: { type: String, required: true },
    terms_and_condition_french: { type: String, required: true },
  },
  {
    collection: "delivery_types",
    timestamps: false,
  }
);

delivery_typesSchema.pre("save", async function (next) {
  if (this.Did == null) {
    this.Did = await getNextSequence("delivery_types");
  }
  next();
});

module.exports = mongoose.models.delivery_types || mongoose.model("delivery_types", delivery_typesSchema);
