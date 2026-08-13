const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const sms_otpSchema = new mongoose.Schema(
  {
    otp_id: { type: Number, required: false },
    user_emailph: { type: String, required: true },
    otp: { type: String, required: true },
    original_otp: { type: String },
    status: { type: Boolean, required: true, default: false },
    created_on: { type: String, required: true },
  },
  {
    collection: "sms_otp",
    timestamps: false,
  }
);

sms_otpSchema.pre("save", async function (next) {
  if (this.otp_id == null) {
    this.otp_id = await getNextSequence("sms_otp");
  }
  next();
});

module.exports = mongoose.models.sms_otp || mongoose.model("sms_otp", sms_otpSchema);
