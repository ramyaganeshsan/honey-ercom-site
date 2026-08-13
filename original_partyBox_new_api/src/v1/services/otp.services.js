const md5 = require("md5");
const { findOne, create, updateOne } = require("../mongo/repo");
const { getCurrentTime, generateRandomString } = require("../utils");
const logger = require("../utils/logger");

const generatePlainOtp = (length = 6) => {
  // Numeric OTP only
  return generateRandomString(length, "0123456789");
};

/**
 * Create and persist an OTP.
 * - otp: md5 hash (used for verify)
 * - original_otp: plain OTP (stored for reference / SMS resend / support)
 */
exports.createAndStoreOtp = async (userEmailOrPhone, options = {}) => {
  const plainOtp =
    options.otp && String(options.otp).trim() !== ""
      ? String(options.otp).trim()
      : generatePlainOtp(options.length || 6);

  const payload = {
    user_emailph: String(userEmailOrPhone).trim(),
    otp: md5(plainOtp),
    original_otp: plainOtp,
    status: 0,
    created_on: String(getCurrentTime().unix()),
  };

  const record = await create("sms_otp", payload);
  return {
    record,
    otp: plainOtp,
    otp_id: record?.otp_id,
  };
};

/**
 * Verify OTP for email/phone.
 * Accepts plain OTP from client; compares against hashed `otp`.
 * Also accepts legacy rows where `otp` was stored as plain text.
 */
exports.verifyStoredOtp = async (userEmailOrPhone, plainOtp) => {
  const value = String(plainOtp || "").trim();
  if (!userEmailOrPhone || !value) return { valid: false, record: null };

  const hashed = md5(value);
  const record = await findOne(
    "sms_otp",
    {
      user_emailph: String(userEmailOrPhone).trim(),
      status: 0,
    },
    { order: [["otp_id", "DESC"]] }
  );

  if (!record) return { valid: false, record: null };

  const matchesHash = record.otp === hashed;
  const matchesPlainLegacy = record.otp === value;
  const matchesOriginal = record.original_otp === value;
  const valid = matchesHash || matchesPlainLegacy || matchesOriginal;

  if (valid) {
    try {
      await updateOne(
        "sms_otp",
        { otp_id: record.otp_id },
        { status: 1 }
      );
      record.status = 1;
    } catch (err) {
      logger.error(err?.message || err);
    }
  }

  return { valid, record };
};

exports.getLatestOtpRecord = async (userEmailOrPhone) => {
  return findOne(
    "sms_otp",
    {
      user_emailph: String(userEmailOrPhone).trim(),
      status: 0,
    },
    { order: [["otp_id", "DESC"]] }
  );
};
