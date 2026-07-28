const { getCMSDetails } = require("../services/cms.services");
const { getStatusCode, getMessage } = require("../utils");
const logger = require("../utils/logger");

const ABOUTUS_CMS_ID = 6;
const TERMS_AND_CONDITION_CMS_ID = 8;
const PRIVACY_POLICY_CMS_ID = 33;
const FAQS_ID = 56;

exports.getAboutUsCMSDetails = async (req, res, next) => {
  try {
    let response = {
      status: getStatusCode("failed"),
      message: getMessage("something_went_wrong_error", req.lang),
      data: {},
    };

    let cmsContent = await getCMSDetails(ABOUTUS_CMS_ID);
    if (cmsContent && cmsContent.length > 0) {
      response = {
        status: getStatusCode("success"),
        message: "",
        data: cmsContent[0],
      };
    }

    res.send(response);
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};

exports.getTermsAndConditionDetails = async (req, res, next) => {
  try {
    let response = {
      status: getStatusCode("failed"),
      message: getMessage("something_went_wrong_error", req.lang),
      data: {},
    };

    let cmsContent = await getCMSDetails(TERMS_AND_CONDITION_CMS_ID);
    if (cmsContent && cmsContent.length > 0) {
      response = {
        status: getStatusCode("success"),
        message: "",
        data: cmsContent[0],
      };
    }

    res.send(response);
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};

exports.getPrivacyPolicyDetails = async (req, res, next) => {
  try {
    let response = {
      status: getStatusCode("failed"),
      message: getMessage("something_went_wrong_error", req.lang),
      data: {},
    };

    let cmsContent = await getCMSDetails(PRIVACY_POLICY_CMS_ID);
    if (cmsContent && cmsContent.length > 0) {
      response = {
        status: getStatusCode("success"),
        message: "",
        data: cmsContent[0],
      };
    }

    res.send(response);
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};

exports.getFaqsDetails = async (req, res, next) => {
  try {
    let response = {
      status: getStatusCode("failed"),
      message: getMessage("something_went_wrong_error", req.lang),
      data: {},
    };

    let cmsContent = await getCMSDetails(FAQS_ID);
    if (cmsContent && cmsContent.length > 0) {
      response = {
        status: getStatusCode("success"),
        message: "",
        data: cmsContent[0],
      };
    }

    res.send(response);
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};
