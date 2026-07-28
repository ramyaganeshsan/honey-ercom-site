import Joi from "joi";
import { t } from "i18next";

export const profileSchema = {
  firstname: Joi.string().required().min(4).max(30).label(t("first_name")),
  lastname: Joi.string().required().max(30).label(t("last_name")),
  // address1: Joi.string().required().min(30).max(250).label(t("address")),
  address1: Joi.string().required().min(10).max(30).label(t("address")),
  city_id: Joi.number().required().label(t("city")),
  state_id: Joi.number().required().label(t("state")),
  country_id: Joi.number().required().label(t("country")),
  gender: Joi.number().required().label(t("gender")),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(30)
    .required()
    .label(t("email")),
  phone_number: Joi.string()
    .required()
    .min(6)
    .max(10)
    .pattern(/^[0-9]+$/)
    .label(t("phone_number")),
};

export const changePasswordSchema = {
  old_password: Joi.string().required().min(6).max(16).label(t("old_password")),
  new_password: Joi.string().required().min(6).max(16).label(t("new_password")),
  confirm_password: Joi.string()
    .required()
    .min(6)
    .max(16)
    .label(t("confirm_password")),
};
