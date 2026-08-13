const { create } = require("../mongo/repo");

exports.addContact = async (contactDetails) => {
  let contactInfo = {
    ...contactDetails,
    status: 1,
  };
  let response = await create("contact", contactInfo);
  return response;
};
