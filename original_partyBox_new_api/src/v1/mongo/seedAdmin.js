/**
 * Seed / upsert the Honey admin user.
 * Usage: npm run seed:admin
 *
 * email: admin@thunayanhoney.com
 * password: Admin@123
 * user_type: 1
 */
require("dotenv").config();
const { connectMongo, disconnectMongo } = require("./connection");
const models = require("./models");
const { ensureAdminUser, ADMIN_EMAIL, ADMIN_PASSWORD } = require("./ensureAdminUser");

async function seedAdmin() {
  await connectMongo();
  console.log("Connected to MongoDB");

  const result = await ensureAdminUser(models);
  console.log(
    `${result.created ? "Created" : "Updated"} admin user (user_id=${result.user_id})`
  );
  console.log(`  email: ${ADMIN_EMAIL}`);
  console.log(`  password: ${ADMIN_PASSWORD}`);
  await disconnectMongo();
  console.log("Done.");
}

seedAdmin().catch(async (err) => {
  console.error(err);
  try {
    await disconnectMongo();
  } catch (_) {}
  process.exit(1);
});
