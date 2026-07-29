-- Store plain OTP alongside hashed OTP.
-- Run against your MySQL database, then restart the API.

ALTER TABLE sms_otp
  MODIFY COLUMN otp VARCHAR(64) NOT NULL
  COMMENT 'Stored OTP value (hashed with md5 for verification)';

ALTER TABLE sms_otp
  ADD COLUMN original_otp VARCHAR(10) NULL
  COMMENT 'Plain original OTP value for reference/audit'
  AFTER otp;

-- Optional: backfill original_otp for old plain 6-digit rows
UPDATE sms_otp
SET original_otp = otp
WHERE (original_otp IS NULL OR original_otp = '')
  AND CHAR_LENGTH(otp) <= 10
  AND otp REGEXP '^[0-9]+$';
