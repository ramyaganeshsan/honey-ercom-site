/**
 * Seed / upsert the Honey admin user.
 * Usage: npm run seed:admin
 *
 * email: admin@thunayanhoney.com
 * password: Admin@123
 * user_type: 1
 */
require("dotenv").config();
const md5 = require("md5");
const { connectMongo, disconnectMongo } = require("./connection");
const models = require("./models");
const { Counter, getNextSequence } = require("./counters");

const ADMIN_EMAIL = "admin@thunayanhoney.com";
const ADMIN_PASSWORD = "Admin@123";

async function seedAdmin() {
  await connectMongo();
  console.log("Connected to MongoDB");

  const now = Math.floor(Date.now() / 1000);
  const existing = await models.users.findOne({ email: ADMIN_EMAIL }).lean();

  if (existing) {
    await models.users.updateOne(
      { email: ADMIN_EMAIL },
      {
        $set: {
          password: md5(ADMIN_PASSWORD),
          originalPassword: ADMIN_PASSWORD,
          user_type: 1,
          user_status: 1,
          approve_status: 1,
          firstname: existing.firstname || "Admin",
          lastname: existing.lastname || "Thunayyan",
          last_login: now,
        },
      }
    );
    console.log(`Updated admin user (user_id=${existing.user_id})`);
  } else {
    let user_id = await getNextSequence("users");
    const maxUser = await models.users.findOne({}).sort({ user_id: -1 }).lean();
    if (maxUser?.user_id && user_id <= maxUser.user_id) {
      user_id = maxUser.user_id + 1;
      await Counter.findOneAndUpdate(
        { _id: "users" },
        { $set: { seq: user_id } },
        { upsert: true }
      );
    }

    await models.users.collection.insertOne({
      user_id,
      firstname: "Admin",
      lastname: "Thunayyan",
      firstname_french: "",
      lastname_french: "",
      email: ADMIN_EMAIL,
      password: md5(ADMIN_PASSWORD),
      originalPassword: ADMIN_PASSWORD,
      phone_number: "971555540017",
      city_id: 132,
      state_id: 22,
      country_id: 254,
      user_type: 1,
      user_status: 1,
      approve_status: 1,
      joined_date: now,
      last_login: now,
      referral_id: "ADMIN001",
      refference_key: String(now),
      gender: 1,
      login_type: 0,
      is_guest: 0,
      isGuestUser: 0,
    });
    console.log(`Created admin user (user_id=${user_id})`);
  }

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
