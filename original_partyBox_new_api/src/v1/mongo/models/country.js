const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const countrySchema = new mongoose.Schema(
  {
    country_id: { type: Number, required: false },
    country_url: { type: String },
    country_name: { type: String },
    country_name_french: { type: String, required: true },
    country_code: { type: String, required: true },
    country_status: { type: Number, required: true, default: 1 },
    currency_symbol: { type: String, required: true },
    currency_code: { type: String, required: true },
  },
  {
    collection: "country",
    timestamps: false,
  }
);

countrySchema.pre("save", async function (next) {
  if (this.country_id == null) {
    this.country_id = await getNextSequence("country");
  }
  next();
});

module.exports = mongoose.models.country || mongoose.model("country", countrySchema);
