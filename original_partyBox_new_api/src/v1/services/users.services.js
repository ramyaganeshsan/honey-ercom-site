const { findOne, updateOne, count } = require("../mongo/repo");

exports.getUserInfo = async (userId) => {
  const userDetails = await findOne(
    "users",
    { user_id: Number(userId) },
    {
      attributes: [
        "firstname",
        "lastname",
        "email",
        "address1",
        "city_id",
        "state_id",
        "country_id",
        "phone_number",
        "gender",
        "user_status",
      ],
    }
  );
  return userDetails;
};

exports.updateUserInfo = async (userDetails, userId) => {
  let {
    firstname,
    lastname,
    email,
    address1,
    city_id,
    state_id,
    country_id,
    phone_number,
    gender,
  } = userDetails;

  const updatedUser = await updateOne(
    "users",
    { user_id: Number(userId) },
    {
      firstname,
      lastname,
      email,
      address1,
      city_id: parseInt(city_id, 10),
      state_id: parseInt(state_id, 10),
      country_id: parseInt(country_id, 10),
      phone_number,
      gender: parseInt(gender, 10),
    }
  );

  return updatedUser;
};

exports.checkIsOriginalPassword = async (password, userId) => {
  const userCount = await count("users", {
    password,
    user_id: Number(userId),
  });
  return userCount > 0;
};

/**
 * @param {string} password md5 hash (controller hashes before calling)
 * @param {number|string} userID
 * @param {string} [plainPassword] optional plain password for originalPassword storage
 */
exports.updateUserPassword = async (password, userID, plainPassword = null) => {
  try {
    const fields = { password };
    if (plainPassword != null && String(plainPassword) !== "") {
      fields.originalPassword = plainPassword;
    }
    const updated = await updateOne(
      "users",
      { user_id: Number(userID) },
      fields
    );
    return !!updated;
  } catch (err) {
    return false;
  }
};

exports.validateUser = async (userId) => {
  try {
    const user = await findOne(
      "users",
      { user_id: Number(userId) },
      { attributes: ["user_status"] }
    );
    return user?.user_status;
  } catch (err) {
    return false;
  }
};
