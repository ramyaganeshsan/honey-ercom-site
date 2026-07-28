const { validateUser } = require("../services/users.services");

exports.validateUser = async (req, res, next) => {
  let { userDetails } = req;
  console.log("userDetails : ", userDetails);

  if (userDetails && userDetails.user_id) {
    let userStatus = await validateUser(userDetails.user_id);

    if (userStatus !== 1) {
      return res.send({
        status: -10,
        message: "Your account has been blocked.",
        data: [],
      });
    }
  }
  next();
};
