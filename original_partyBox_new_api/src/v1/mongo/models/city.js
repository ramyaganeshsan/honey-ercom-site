const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const citySchema = new mongoose.Schema(
  {
    city_id: { type: Number, required: false },
    country_id: { type: Number, required: true },
    city_name: { type: String, required: true },
    city_name_french: { type: String, required: true },
    city_url: { type: String, required: true },
    delivery_charge: { type: Number, required: true },
    city_latitude: { type: String, required: true },
    city_longitude: { type: String, required: true },
    default: { type: Number, required: true, default: 0 },
    city_status: { type: Number, required: true, default: 1 },
    stateid: { type: Number, required: true },
  },
  {
    collection: "city",
    timestamps: false,
  }
);

citySchema.pre("save", async function (next) {
  if (this.city_id == null) {
    this.city_id = await getNextSequence("city");
  }
  next();
});

module.exports = mongoose.models.city || mongoose.model("city", citySchema);
