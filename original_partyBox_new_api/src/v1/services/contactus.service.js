const { contact } = require("../models");

exports.addContact = async (contactDetails) => {
  let contactInfo = {
    ...contactDetails,
    status: 1,
  };
  let response = await contact.create(contactInfo);
  return response;
};
