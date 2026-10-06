#!/usr/bin/env node
/**
 * Ensures bulk-upload packages exist before `npm start`.
 * After a git pull, local node_modules may be stale — install if needed.
 */
const { execSync } = require("child_process");
const path = require("path");

const REQUIRED = ["exceljs", "adm-zip"];

function missingDeps() {
  return REQUIRED.filter((name) => {
    try {
      require.resolve(name);
      return false;
    } catch {
      return true;
    }
  });
}

const missing = missingDeps();
if (!missing.length) {
  process.exit(0);
}

console.error(
  `[deps] Missing packages required for product bulk upload: ${missing.join(", ")}`
);
console.error("[deps] Running npm install in original_partyBox_new_api …");

try {
  execSync("npm install", {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
    env: process.env,
  });
} catch (err) {
  console.error(
    "[deps] npm install failed. From original_partyBox_new_api run:\n  npm install"
  );
  process.exit(1);
}

const stillMissing = missingDeps();
if (stillMissing.length) {
  console.error(
    `[deps] Still missing after install: ${stillMissing.join(", ")}. Run: npm install`
  );
  process.exit(1);
}

console.error("[deps] Bulk upload packages ready.");
