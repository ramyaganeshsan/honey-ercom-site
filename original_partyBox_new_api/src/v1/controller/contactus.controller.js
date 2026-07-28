const { getStatusCode, getMessage } = require("../utils");
const logger = require("../utils/logger");
const { addContact } = require("../services/contactus.service");
const { getAdminEmail } = require("../services/checkout.services");
const {
  notifyContactUsToAdminEmail,
} = require("../services/notification.services");

exports.addContact = async (req, res, next) => {
  try {
    let { body } = req;
    let response = await addContact(body);
    console.log("response of add contact : ", response);
    if (response && response?.contact_id) {
      res.send({
        status: getStatusCode("success"),
        message: getMessage("contact_successfully_created", req.lang),
      });
      let contactId = response?.contact_id;
      let name = response?.name;
      let phone = response?.phone_number;
      let notes = response?.message;
      let email = response?.email;
      let adminEmail = await getAdminEmail();
      notifyContactUsToAdminEmail(
        name,
        contactId,
        phone,
        email,
        notes,
        adminEmail,
        req.lang
      );
    } else {
      res.send({
        status: getStatusCode("failed"),
        message: getMessage("failed_to_create_contact", req.lang),
      });
    }
  } catch (err) {
    console.log(err);
    logger(err);
    next(err);
  }
};
