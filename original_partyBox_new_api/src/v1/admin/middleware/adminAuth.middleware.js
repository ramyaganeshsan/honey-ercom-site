const JWT = require("jsonwebtoken");
const { findOne } = require("../../mongo/repo");

/** Admin user_type — storefront customers are 4 */
const ADMIN_USER_TYPES = [1, 2];

exports.ADMIN_USER_TYPES = ADMIN_USER_TYPES;

exports.isAdminUserType = (userType) =>
  ADMIN_USER_TYPES.includes(Number(userType));

/**
 * Require a valid admin JWT (header: token: Bearer <jwt>).
 * Attaches req.adminDetails = { user_id, email, firstname, lastname, user_type }.
 */
exports.requireAdmin = async (req, res, next) => {
  try {
    let token = req.get("token") || req.get("authorization") || "";
    if (token.toLowerCase().startsWith("bearer")) {
      token = token.replace(/^bearer\s+/i, "").trim();
    } else if (token.includes("Bearer")) {
      token = token.split("Bearer")[1]?.trim() || "";
    }
    token = token.trim();

    if (!token) {
      return res.status(401).send({
        status: -1,
        message: "Admin authentication required",
      });
    }

    const { resolveJwtSecret } = require("../../utils/index");
    const secret = resolveJwtSecret();
    if (!secret) {
      return res.status(500).send({
        status: 0,
        message:
          "Server JWT secret missing. Set JWT_SECRECT in API .env and restart.",
        data: null,
      });
    }
    const decoded = JWT.verify(token, secret);
    if (!exports.isAdminUserType(decoded?.user_type)) {
      return res.status(403).send({
        status: -1,
        message: "Admin access denied",
      });
    }

    const user = await findOne(
      "users",
      { user_id: Number(decoded.user_id) },
      {
        attributes: [
          "user_id",
          "email",
          "firstname",
          "lastname",
          "user_type",
          "user_status",
        ],
      }
    );

    if (!user || Number(user.user_status) !== 1) {
      return res.status(403).send({
        status: -1,
        message: "Admin account inactive or not found",
      });
    }

    if (!exports.isAdminUserType(user.user_type)) {
      return res.status(403).send({
        status: -1,
        message: "Admin access denied",
      });
    }

    req.adminDetails = {
      user_id: user.user_id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      user_type: user.user_type,
    };
    req.lang = req.get("lang") === "ar" ? "ar" : "en";
    next();
  } catch (err) {
    return res.status(401).send({
      status: -1,
      message: "Invalid or expired admin token",
    });
  }
};
