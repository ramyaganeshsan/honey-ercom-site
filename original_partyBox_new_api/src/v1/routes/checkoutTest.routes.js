const express = require("express");
const checkoutTestRoutes = express.Router();

const { validateParams } = require("../middleware/auth.middleware");
const {
  getUserCheckoutDetails,
  validateCheckoutDetails,
  getPaymentStatus,
  initiateTabbyPayment,
  verifyPayment,
  handleTabbyWebhook,
  registerWebhook,
  createTamaraSesson,
  sendOrderStaus,
  registerTamaraWebhook,
  handleTamaraWekhook,
  fetchSubProductDimensions,
  DHLRating,
} = require("../controller/checkoutTest.controller");
const {
  cartCheckoutSchema,
  validatePaymentStatusSchema,
} = require("../validation/checkout.validation");
checkoutTestRoutes
  .route("/")
  .get(getUserCheckoutDetails)
  .post(validateParams(cartCheckoutSchema), validateCheckoutDetails)
  .put(validateParams(validatePaymentStatusSchema), getPaymentStatus);
checkoutTestRoutes.route("/initiateTabbyPayment").post(initiateTabbyPayment);
checkoutTestRoutes.route("/verifyTabbyPayment").get(verifyPayment);
checkoutTestRoutes.route("/webhooks/tabby").post(handleTabbyWebhook);
checkoutTestRoutes.route("/webhooksRegister").post(registerWebhook);
checkoutTestRoutes.route("/createTamaraSesson").post(createTamaraSesson);
checkoutTestRoutes.route("/authorisePayment").post(sendOrderStaus);
checkoutTestRoutes.route("/registerWebhooks").post(registerTamaraWebhook);
checkoutTestRoutes.route("/tamara-webhook").post(handleTamaraWekhook);
checkoutTestRoutes.route("/fetchDimensions").post(fetchSubProductDimensions);
checkoutTestRoutes.route("/DHLGetratingApi").get(DHLRating);

module.exports = checkoutTestRoutes;
