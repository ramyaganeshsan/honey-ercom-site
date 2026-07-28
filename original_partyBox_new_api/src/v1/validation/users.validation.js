const JOI = require("joi");

exports.userProfileSchema = {
  body: JOI.object().keys({
    firstname: JOI.string().min(3).max(30).required().label("First name"),
    lastname: JOI.string().min(3).max(30).required().label("Last name"),
    email: JOI.string().email().required().label("Email"),
    // address1: JOI.string().min(30).max(250).required().label("Address"),
    address1: JOI.string().min(10).max(30).required().label("Address"),
    city_id: JOI.number().required().label("City"),
    state_id: JOI.number().required().label("State"),
    country_id: JOI.number().required().label("Country"),
    phone_number: JOI.string().min(6).max(10).required().label("Phone number"),
    gender: JOI.string().required().label("Gender"),
    // lang: JOI.string().required(),
  }),
};

exports.updatePasswordSchema = {
  body: JOI.object().keys({
    old_password: JOI.string()
      .required()
      .min(6)
      .max(16)
      .label("Original passeword"),
    new_password: JOI.string().required().min(6).max(16).label("New passeword"),
    confirm_password: JOI.string()
      .equal(JOI.ref("new_password"))
      .required()
      .label("Confirm password")
      .messages({ "any.only": "{{#label}} does not match with password" }),
  }),
};
