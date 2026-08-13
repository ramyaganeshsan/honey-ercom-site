const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const company_sms_settingsSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    company_id: { type: String, required: true },
    sms_account_id: { type: String, required: true },
    sms_auth_token: { type: String, required: true },
    sms_from_number: { type: String, required: true },
    createddate: { type: Number, required: true },
    updatedate: { type: Number, required: true },
  },
  {
    collection: "company_sms_settings",
    timestamps: false,
  }
);

company_sms_settingsSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("company_sms_settings");
  }
  next();
});

module.exports = mongoose.models.company_sms_settings || mongoose.model("company_sms_settings", company_sms_settingsSchema);
