const JOI = require("joi");

exports.signupSchema = {
  body: JOI.object().keys({
    firstname: JOI.string().required().label("First name"),
    lastname: JOI.string().required().label("Last name"),
    email: JOI.string().email().required().label("Email"),
    phone_number: JOI.string().allow(null, "").label("Phone number"),
    password: JOI.string().required().label("Password"),
    confirm_password: JOI.any()
      .equal(JOI.ref("password"))
      .required()
      .label("Confirm password")
      .messages({ "any.only": "{{#label}} does not match with password" }),
  }),
};

exports.loginSchema = {
  body: JOI.object().keys({
    email: JOI.string().email().required().label("Email"),
    password: JOI.string().required().label("Password"),
  }),
};
