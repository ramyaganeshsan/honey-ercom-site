const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const contact = require("../controllers/contact.controller");

router.use(requireAdmin);

router.get("/", contact.listContacts);
router.get("/:contactId", contact.getContact);
router.put("/:contactId", contact.markContact);
router.put("/:contactId/status", contact.markContact);
router.delete("/:contactId", contact.deleteContact);

module.exports = router;
