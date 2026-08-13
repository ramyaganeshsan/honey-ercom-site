const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");
const { optionalString } = require("../schemaHelpers");

const citySchema = new mongoose.Schema(
  {
    city_id: { type: Number, required: false },
    country_id: { type: Number, required: true, default: 1 },
    city_name: { type: String, required: true },
    city_name_french: optionalString,
    city_url: optionalString,
    delivery_charge: { type: Number, required: true, default: 0 },
    city_latitude: { type: String, default: "0" },
    city_longitude: { type: String, default: "0" },
    default: { type: Number, required: true, default: 0 },
    city_status: { type: Number, required: true, default: 1 },
    stateid: { type: Number, required: true, default: 1 },
  },
  {
    collection: "city",
    timestamps: false,
  }
);

citySchema.pre("validate", function (next) {
  if (!this.city_name_french) {
    this.city_name_french = this.city_name || "";
  }
  if (!this.city_url && this.city_name) {
    this.city_url = String(this.city_name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

citySchema.pre("save", async function (next) {
  if (this.city_id == null) {
    this.city_id = await getNextSequence("city");
  }
  next();
});

module.exports = mongoose.models.city || mongoose.model("city", citySchema);
