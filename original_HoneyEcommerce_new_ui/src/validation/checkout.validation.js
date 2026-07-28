import Joi from "joi";

export const checkoutFormSchema = {
  name: Joi.string().required().min(4).max(30).label("Name"),
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
  country: Joi.number().required().label("Country"),
  state: Joi.number().required().label("State"),
  city: Joi.number().required().label("City"),
  paymentMethod: Joi.number().required().label("Payment method"),
  isPickupFromStore: Joi.any().required().label("Delivery type"),
  address: Joi.string().required().max(250).label("Address"),
  // address: Joi.string().required().min(30).max(250).label("Address"),

  // address: Joi.string().required().min(10).max(30).label("Address"),
  notes: Joi.string().min(10).max(250).allow(null, "").label("Notes"),
};
