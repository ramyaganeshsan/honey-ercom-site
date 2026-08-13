const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const shopsSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    shop_address: { type: String, required: true },
    shop_days: { type: String, required: true },
    contact_number: { type: String, required: true },
    latitude_longitude: { type: String, required: true },
    status: { type: Number, required: true, default: 1 },
  },
  {
    collection: "shops",
    timestamps: false,
  }
);

shopsSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("shops");
  }
  next();
});

module.exports = mongoose.models.shops || mongoose.model("shops", shopsSchema);
