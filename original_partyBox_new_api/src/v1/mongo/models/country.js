const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");
const { optionalString } = require("../schemaHelpers");

const countrySchema = new mongoose.Schema(
  {
    country_id: { type: Number, required: false },
    country_url: optionalString,
    country_name: { type: String, required: true },
    country_name_french: optionalString,
    country_code: optionalString,
    country_status: { type: Number, required: true, default: 1 },
    currency_symbol: { type: String, default: "AED" },
    currency_code: { type: String, default: "AED" },
    ISO_country_code: optionalString,
  },
  {
    collection: "country",
    timestamps: false,
  }
);

countrySchema.pre("validate", function (next) {
  if (!this.country_name_french) {
    this.country_name_french = this.country_name || "";
  }
  next();
});

countrySchema.pre("save", async function (next) {
  if (this.country_id == null) {
    this.country_id = await getNextSequence("country");
  }
  next();
});

module.exports = mongoose.models.country || mongoose.model("country", countrySchema);
