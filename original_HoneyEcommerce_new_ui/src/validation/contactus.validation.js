const JOI = require("joi");

export const contactUsSchema = {
  name: JOI.string().required().max(30).label("Name"),
  email: JOI.string()
    .email({ tlds: { allow: false } })
    .required()
    .max(30)
    .label("Email"),
  phone_number: JOI.string()
    .required()
    .max(15)
    .pattern(/^[0-9]+$/)
    .label("Phone number"),
  message: JOI.string().required().max(250).label("Message"),
};
