const JOI = require("joi");

exports.contactUsSchema = {
  body: JOI.object().keys({
    name: JOI.string().required().max(30).label("Name"),
    email: JOI.string().email().required().max(30).label("Email"),
    phone_number: JOI.string().required().max(30).label("Phone number"),
    message: JOI.string().required().max(250).label("Message"),
  }),
};
