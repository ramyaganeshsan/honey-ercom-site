const { findOne, updateOne, deleteOne } = require("../../mongo/repo");
const { ok, fail, listCollection } = require("../services/admin.helpers");

exports.listContacts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status !== undefined && req.query.status !== "") {
      filter.status = Number(req.query.status);
    }
    const q = String(req.query.search || req.query.q || "").trim();
    if (q) {
      const rx = { $regex: q, $options: "i" };
      filter.$or = [{ name: rx }, { email: rx }, { phone_number: rx }, { message: rx }];
    }
    const data = await listCollection("contact", filter, req.query, {
      order: [["contact_id", "DESC"]],
    });
    return res.send(ok(data));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to list contacts"));
  }
};

exports.getContact = async (req, res) => {
  try {
    const item = await findOne("contact", {
      contact_id: Number(req.params.contactId),
    });
    if (!item) {
      return res.send(fail("Contact not found"));
    }
    return res.send(ok(item));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to load contact"));
  }
};

exports.markContact = async (req, res) => {
  try {
    const contactId = Number(req.params.contactId);
    const status =
      req.body?.status !== undefined ? Number(req.body.status) : 0;
    const updated = await updateOne(
      "contact",
      { contact_id: contactId },
      { status }
    );
    if (!updated) {
      return res.send(fail("Contact not found"));
    }
    return res.send(ok(updated, "Contact updated"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to update contact"));
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contactId = Number(req.params.contactId);
    const result = await deleteOne("contact", { contact_id: contactId });
    if (!result?.deletedCount) {
      return res.send(fail("Contact not found"));
    }
    return res.send(ok(null, "Contact deleted"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to delete contact"));
  }
};
