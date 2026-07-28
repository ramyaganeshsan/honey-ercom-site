-- Fix missing settings columns that crash getSiteInfo / home page load.
-- Run against your MySQL database (DATABASE_NAME from .env), then restart the API.
-- Safe to skip any statement that errors with "Duplicate column name".

ALTER TABLE settings
  ADD COLUMN minimumProductQuantityToNotify INT NULL DEFAULT 5
  COMMENT 'Notify admin when product stock falls to this quantity';

ALTER TABLE settings
  ADD COLUMN adminEmailAddress VARCHAR(255) NULL
  COMMENT 'Admin email for out-of-stock notifications';

ALTER TABLE settings
  ADD COLUMN sendOutOfStockNotification TINYINT(1) NULL DEFAULT 0
  COMMENT 'Whether to send out-of-stock notification emails';

-- Optional: seed notification defaults on the existing settings row
UPDATE settings
SET
  minimumProductQuantityToNotify = COALESCE(minimumProductQuantityToNotify, 5),
  adminEmailAddress = COALESCE(adminEmailAddress, contact_email),
  sendOutOfStockNotification = COALESCE(sendOutOfStockNotification, 0);
