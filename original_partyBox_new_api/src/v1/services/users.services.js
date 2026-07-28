const { users } = require("../models");
const tableConfig = require("../database/table.config.json");

exports.getUserInfo = async (userId) => {
  let condition = {
    user_id: Number(userId),
  };
  let filters = {
    where: condition,
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
  };
  const userDetails = await users.findOne(filters);
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

  const updatedUser = await users.update(
    {
      firstname,
      lastname,
      email,
      address1,
      city_id: parseInt(city_id),
      state_id: parseInt(state_id),
      country_id: parseInt(country_id),
      phone_number,
      gender: parseInt(gender),
    },
    {
      where: {
        user_id: userId,
      },
    }
  );

  return updatedUser;
};

exports.checkIsOriginalPassword = async (password, userId) => {
  let query = `
    SELECT 
      COUNT("user_id") AS user_count 
    FROM ${tableConfig.users} 
    WHERE 
      password = "${password}" 
    AND 
      user_id = ${userId};
  `;
  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return response && response[0] && response[0]["user_count"] ? true : false;
};

exports.updateUserPassword = async (password, userID) => {
  try {
    let query = `UPDATE ${tableConfig.users} SET password = "${password}" WHERE user_id = ${userID}`;
    await global?.SEQUELIZE?.query(query, {
      type: global?.SEQUELIZE?.QueryTypes?.UPDATE,
    });
    return true;
  } catch (err) {
    return false;
  }
};

exports.validateUser = async (userId) => {
  try {
    let query = `SELECT user_status 
    FROM ${tableConfig.users}
    WHERE user_id = ${userId}`;
    console.log("query : ", query);
    let repsonse = await global?.SEQUELIZE?.query(query, {
      type: global?.SEQUELIZE?.QueryTypes?.SELECT,
    });
    return repsonse[0]?.user_status;
  } catch (err) {
    return false;
  }
};
