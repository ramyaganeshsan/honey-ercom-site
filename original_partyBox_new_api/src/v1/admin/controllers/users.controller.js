const md5 = require("md5");
const { getCurrentTime } = require("../../utils/index");
const { findOne, create, updateOne } = require("../../mongo/repo");
const { ok, fail, listCollection } = require("../services/admin.helpers");

const CUSTOMER_TYPE = 4;

exports.listUsers = async (req, res) => {
  try {
    const filter = { user_type: CUSTOMER_TYPE };
    const q = String(req.query.search || req.query.q || "").trim();
    if (q) {
      const rx = { $regex: q, $options: "i" };
      filter.$or = [
        { email: rx },
        { firstname: rx },
        { lastname: rx },
        { phone_number: rx },
      ];
    }
    if (req.query.user_status !== undefined && req.query.user_status !== "") {
      filter.user_status = Number(req.query.user_status);
    }

    const data = await listCollection("users", filter, req.query, {
      order: [["user_id", "DESC"]],
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
        "city_id",
        "state_id",
        "country_id",
      ],
    });
    return res.send(ok(data));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to list users"));
  }
};

exports.getUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const user = await findOne(
      "users",
      { user_id: userId, user_type: CUSTOMER_TYPE },
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
          "address1",
          "address2",
          "city_id",
          "state_id",
          "country_id",
          "ship_name",
          "ship_address1",
          "ship_address2",
          "ship_city",
          "ship_state",
          "ship_country",
          "ship_mobileno",
          "ship_zipcode",
        ],
      }
    );
    if (!user) {
      return res.send(fail("User not found"));
    }
    return res.send(ok(user));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to load user"));
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const user_status = Number(req.body?.user_status);
    if (![0, 1].includes(user_status)) {
      return res.send(fail("user_status must be 0 or 1"));
    }

    const updated = await updateOne(
      "users",
      { user_id: userId, user_type: CUSTOMER_TYPE },
      { user_status }
    );
    if (!updated) {
      return res.send(fail("User not found"));
    }
    return res.send(
      ok(
        { user_id: updated.user_id, user_status: updated.user_status },
        user_status === 1 ? "User unblocked" : "User blocked"
      )
    );
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to update user status"));
  }
};

exports.createAdminUser = async (req, res) => {
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
