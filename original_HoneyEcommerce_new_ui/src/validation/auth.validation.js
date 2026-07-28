import Joi from "joi";

export const loginFormSchema = {
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  password: Joi.string().required().label("Password"),
};

export const signupFormSchema = {
  firstname: Joi.string().required().min(4).max(30).label("First name"),
  lastname: Joi.string().required().max(30).label("Last name"),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  phone_number: Joi.string()
    .required()
    .min(6)
    .max(10)
    .pattern(/^[0-9]+$/)
    .label("Phone number"),
  password: Joi.string().min(6).max(16).required().label("Password"),
  confirm_password: Joi.string()
    .min(6)
    .max(16)
    .required()
    .label("Confirm password"),
};
