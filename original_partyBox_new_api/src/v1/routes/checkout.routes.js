const express = require("express");
const checkoutRoutes = express.Router();

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
  handleDHLWebhook,
} = require("../controller/checkout.controller");
const {
  cartCheckoutSchema,
  validatePaymentStatusSchema,
} = require("../validation/checkout.validation");
checkoutRoutes
  .route("/")
  .get(getUserCheckoutDetails)
  .post(validateParams(cartCheckoutSchema), validateCheckoutDetails)
  .put(validateParams(validatePaymentStatusSchema), getPaymentStatus);
checkoutRoutes.route("/initiateTabbyPayment").post(initiateTabbyPayment);
checkoutRoutes.route("/verifyTabbyPayment").get(verifyPayment);
checkoutRoutes.route("/webhooks/tabby").post(handleTabbyWebhook);
checkoutRoutes.route("/webhooksRegister").post(registerWebhook);
checkoutRoutes.route("/createTamaraSesson").post(createTamaraSesson);
checkoutRoutes.route("/authorisePayment").post(sendOrderStaus);
checkoutRoutes.route("/registerWebhooks").post(registerTamaraWebhook);
checkoutRoutes.route("/tamara-webhook").post(handleTamaraWekhook);
checkoutRoutes.route("/fetchDimensions").post(fetchSubProductDimensions);
checkoutRoutes.route("/DHLGetratingApi").get(DHLRating);
checkoutRoutes.route("/DHLWebhook").post(handleDHLWebhook);

module.exports = checkoutRoutes;
