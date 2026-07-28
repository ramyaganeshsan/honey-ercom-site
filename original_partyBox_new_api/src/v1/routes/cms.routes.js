const express = require("express");
const cmsRoutes = express.Router();

const {
  getAboutUsCMSDetails,
  getTermsAndConditionDetails,
  getPrivacyPolicyDetails,
  getFaqsDetails,
} = require("../controller/cms.controller");

cmsRoutes.get("/about_us", getAboutUsCMSDetails);
cmsRoutes.get("/terms_and_condition", getTermsAndConditionDetails);
cmsRoutes.get("/privacy_policy", getPrivacyPolicyDetails);
cmsRoutes.get("/faqs", getFaqsDetails);

module.exports = cmsRoutes;
