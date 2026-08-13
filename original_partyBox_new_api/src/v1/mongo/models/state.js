const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");
const { optionalString } = require("../schemaHelpers");

const stateSchema = new mongoose.Schema(
  {
    state_id: { type: Number, required: false },
    state_name: { type: String, required: true },
    state_name_arabic: optionalString,
    state_url: optionalString,
    state_country_id: { type: Number, required: true, default: 1 },
    statestatus: { type: Number, required: true, default: 1 },
  },
  {
    collection: "state",
    timestamps: false,
  }
);

stateSchema.pre("validate", function (next) {
  if (!this.state_name_arabic) {
    this.state_name_arabic = this.state_name || "";
  }
  if (!this.state_url && this.state_name) {
    this.state_url = String(this.state_name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

stateSchema.pre("save", async function (next) {
  if (this.state_id == null) {
    this.state_id = await getNextSequence("state");
  }
  next();
});

module.exports = mongoose.models.state || mongoose.model("state", stateSchema);
