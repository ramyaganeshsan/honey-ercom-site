const logger = require("../utils/logger");
const {
  getUserInfo,
  checkIsOriginalPassword,
  updateUserPassword,
} = require("../services/users.services");
const { updateUserInfo } = require("../services/users.services");
const { getStatusCode, getMessage } = require("../utils/index");
const md5 = require("md5");

const {
  checkUserEmailExists,
  checkUserPhoneNumberExists,
} = require("../services/common.services");

exports.getUserInfo = async (req, res, next) => {
  try {
    let { userDetails } = req;
    let user = await getUserInfo(userDetails?.user_id);

    let response = {
      status: getStatusCode("success"),
      message: getMessage(""),
      data: user,
    };

    if (user == null) {
      response = {
        status: getStatusCode("invalid_user"),
        message: getMessage("user_details_not_found", req.lang),
        data: {},
      };

      return res.send(response);
    }

    let usersStatus = user.user_status;
    if (usersStatus == 0) {
      response = {
        status: getStatusCode("invalid_user"),
        message: getMessage("blocked_user", req.lang),
        data: {},
      };
    }

    res.send(response);
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};

exports.updateUserInfo = async (req, res, next) => {
  try {
    let { userDetails } = req;

    let isPhoneNumberAlreadyExists = await checkUserPhoneNumberExists(
      req.body.phone_number,
      userDetails.user_id
    );
    if (isPhoneNumberAlreadyExists) {
      let response = {
        status: getStatusCode("failed"),
        message: getMessage("phone_already_exists", req.lang),
        data: {},
      };
      return res.send(response);
    }

    let isEmailAlreadyExists = await checkUserEmailExists(
      req.body.email,
      userDetails.user_id
    );
    if (isEmailAlreadyExists) {
      let response = {
        status: getStatusCode("failed"),
        message: getMessage("email_already_exists", req.lang),
        data: {},
      };
      return res.send(response);
    }

    let user = await updateUserInfo(req.body, userDetails?.user_id);
    if (user) {
      let response = {
        status: getStatusCode("success"),
        message: getMessage("user_updated", req.lang),
        data: {},
      };
      return res.send(response);
    } else {
      let response = {
        status: getStatusCode("failed"),
        message: getMessage("user_not_updated", req.lang),
        data: {},
      };
      return res.send(response);
    }
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    let { old_password, new_password } = req.body;
    let { userDetails } = req;

    let encryptedOriginalPassword = md5(old_password);
    let encryptedNewPassword = md5(new_password);
    let isInvalidOriginalPassword = await checkIsOriginalPassword(
      encryptedOriginalPassword,
      userDetails.user_id
    );

    let response = {
      status: getStatusCode("success"),
      message: getMessage("password_updated", req.lang),
      data: {},
    };

    if (!isInvalidOriginalPassword) {
      response["status"] = getStatusCode("failed");
      response["message"] = getMessage("old_password_mismatch", req.lang);
      return res.send(response);
    }

    let updateResponse = await updateUserPassword(
      encryptedNewPassword,
      userDetails.user_id
    );
    if (!updateResponse) {
      response["status"] = getStatusCode("failed");
      response["message"] = getMessage("failed_to_updated_password", req.lang);
    }

    res.send(response);
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};
