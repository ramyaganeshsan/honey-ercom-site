const md5 = require("md5");
const { generateJwtToken, getCurrentTime } = require("../../utils/index");
const { findOne, create, updateOne } = require("../../mongo/repo");
const { ADMIN_USER_TYPES } = require("../middleware/adminAuth.middleware");
const { ok, fail } = require("../services/admin.helpers");

exports.login = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim();
    const password = String(req.body?.password || "");
    if (!email || !password) {
      return res.send(fail("Email and password are required"));
    }

    const user = await findOne(
      "users",
      {
        email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        password: md5(password),
        user_type: { $in: ADMIN_USER_TYPES },
      },
      {
        attributes: [
          "user_id",
          "firstname",
          "lastname",
          "email",
          "phone_number",
          "user_type",
          "user_status",
        ],
      }
    );

    if (!user) {
      return res.send(
        fail(
          "Invalid admin credentials. For local setup run: npm run seed:admin (admin@thunayanhoney.com / Admin@123)"
        )
      );
    }
    if (Number(user.user_status) !== 1) {
      return res.send(fail("Admin account is inactive"));
    }

    await updateOne(
      "users",
      { user_id: user.user_id },
      { last_login: getCurrentTime().unix() }
    );

    const token = generateJwtToken({
      user_id: user.user_id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      user_type: user.user_type,
    });

    return res.send(
      ok(
        {
          token,
          user: {
            user_id: user.user_id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            user_type: user.user_type,
            phone_number: user.phone_number,
          },
        },
        "Login successful"
      )
    );
  } catch (err) {
    console.error(err);
    return res.send(fail("Admin login failed"));
  }
};

exports.me = async (req, res) => {
  try {
    const user = await findOne(
      "users",
      { user_id: Number(req.adminDetails.user_id) },
      {
        attributes: [
          "user_id",
          "firstname",
          "lastname",
          "email",
          "phone_number",
          "user_type",
          "user_status",
          "joined_date",
          "last_login",
        ],
      }
    );
    if (!user) {
      return res.send(fail("Admin not found"));
    }
    return res.send(ok(user));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to load admin profile"));
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const firstname = String(req.body?.firstname || "Admin").trim();
    const lastname = String(req.body?.lastname || "").trim();

    if (!email || !password) {
      return res.send(fail("Email and password are required"));
    }

    const existing = await findOne("users", { email });
    if (existing) {
      return res.send(fail("Email already exists"));
    }

    const now = getCurrentTime().unix();
    const user = await create("users", {
      firstname,
      lastname,
      firstname_french: "",
      lastname_french: "",
      email,
      password: md5(password),
      originalPassword: password,
      phone_number: String(req.body?.phone_number || ""),
      city_id: 132,
      state_id: 22,
      country_id: 254,
      user_type: 1,
      user_status: 1,
      approve_status: 1,
      joined_date: now,
      last_login: now,
      referral_id: "",
      refference_key: String(now),
      gender: 1,
      login_type: 0,
    });

    return res.send(
      ok(
        {
          user_id: user.user_id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          user_type: user.user_type,
        },
        "Admin user created"
      )
    );
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to create admin user"));
  }
};
