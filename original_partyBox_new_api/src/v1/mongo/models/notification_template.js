const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const notification_templateSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    email_from: { type: String, required: true, default: "hello@q8partybox.com" },
    template_index: { type: String, required: true },
    send_email: { type: Boolean, required: true },
    subject: { type: String, required: true },
    subject_ar: { type: String },
    template_content: { type: String, required: true },
    template_content_ar: { type: String, required: true },
  },
  {
    collection: "notification_template",
    timestamps: false,
  }
);

notification_templateSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("notification_template");
  }
  next();
});

module.exports = mongoose.models.notification_template || mongoose.model("notification_template", notification_templateSchema);
