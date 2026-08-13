const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const email_settingsSchema = new mongoose.Schema(
  {
    settings_id: { type: Number, required: false },
    sendgrid_host: { type: String, required: true },
    sendgrid_port: { type: Number, required: true },
    sendgrid_username: { type: String, required: true },
    sendgrid_password: { type: String, required: true },
    smtp_host: { type: String, required: true },
    smtp_port: { type: Number, required: true },
    smtp_type: { type: String, default: "ssl" },
    smtp_username: { type: String, required: true },
    smtp_password: { type: String, required: true },
    api_key: { type: String, required: true },
    list_id: { type: String, required: true },
    replay_to_mail: { type: String, required: true },
    from_name: { type: String, required: true },
    status: { type: Number, required: true, default: 1 },
  },
  {
    collection: "email_settings",
    timestamps: false,
  }
);

email_settingsSchema.pre("save", async function (next) {
  if (this.settings_id == null) {
    this.settings_id = await getNextSequence("email_settings");
  }
  next();
});

module.exports = mongoose.models.email_settings || mongoose.model("email_settings", email_settingsSchema);
