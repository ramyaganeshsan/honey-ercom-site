const Express = require("express");
const contactUsRoutes = Express.Router();

const { validateParams } = require("../middleware/auth.middleware");
const { contactUsSchema } = require("../validation/contactus.validation");
const { addContact } = require("../controller/contactus.controller");

contactUsRoutes.route("/").post(validateParams(contactUsSchema), addContact);

module.exports = contactUsRoutes;
