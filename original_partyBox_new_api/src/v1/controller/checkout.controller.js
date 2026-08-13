const {
  getUserCheckoutDetails,
  getUserAddDetails,
  getCartProducts,
  getCityShippingCost,
  updateCartCheckoutDetails,
  updateCartTransactionDetails,
  updateCartTransactionDetailsCashOnDelivery,
  getCartAndCartProductDetails,
  removeExistingCartDetails,
  getAdminEmail,

  updateTabbyCartDetails,
  updateCartTransactionDetailsTabby,
  updateTabbyInstallmentDetails,
  updateTamaraInstallmentDetails,
  fetchDimensionsFromService,
  DHLShipmentEvent,
} = require("../services/checkout.services");
const {
  getShippingStateCityInfo,
  getSiteInfo,
  getUserProfileUsingPhoneNumber,
  createUserAndMoveProductFromSession,
} = require("../services/common.services");

const {
  getStatusCode,
  getMessage,
  currencyFormatter,
  discountCalculator,
  getCurrentTimestamp,
  isValidUserDetails,
  deserializeData,
  generateRandomString,
  generateJwtToken,
  getUserSessionDetails,
  getUUID,
} = require("../utils");
const logger = require("../utils/logger");
const {
  PaymentMethodsDetails,
  getFallbackPaymentMethods,
  executePaymentDetails,
  validatePaymentStatus,
} = require("../services/payment.services");

async function resolvePaymentMethods() {
  try {
    const methods = await PaymentMethodsDetails();
    if (Array.isArray(methods) && methods.length > 0) return methods;
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    logger.error("PaymentMethodsDetails error:", error);
  }
  return getFallbackPaymentMethods();
}
const { validatePromocode } = require("../services/promocode.services");
const {
  PAYMENT_FAILED_URL,
  PAYMENT_SUCCESS_URL,
} = require("../utils/constants");
const {
  sendOrderSuccessEmail,
  sendOrderSuccessEmailToAdmin,
} = require("../services/notification.services");
const {
  getCartDetailsUsingSessionDetails,
  removeAllCartProducts,
} = require("../services/cart.services");
const axios = require("axios");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

exports.getUserCheckoutDetails = async (req, res, next) => {
  try {
    let { userDetails } = req;
    let sessionID = req.userSessionID;

    console.error("====================================");

    if (!sessionID && !isValidUserDetails(userDetails)) {
      let response = {
        status: getStatusCode("failed"),
        message: getMessage("empty_cart", req.lang),
        data: {},
      };
      return res.send(response);
    }

    if (sessionID && !isValidUserDetails(userDetails)) {
      let sessionCartDetails = await getUserSessionDetails(sessionID);

      if (
        sessionCartDetails &&
        sessionCartDetails.length > 0 &&
        !sessionCartDetails[0]["isMovedToUsers"]
      ) {
        if (sessionCartDetails[0]["cart"]) {
          let deserializedCartDetails = deserializeData(
            sessionCartDetails[0]["cart"]
          );
          let cartDetails = deserializedCartDetails;
          let [
            stateAndCityDetails,
            // paymentMethods,
            siteSettings,
            userCheckoutProducts,
          ] = await Promise.all([
            getShippingStateCityInfo(),
            // PaymentMethodsDetails(),
            getSiteInfo(),
            getCartDetailsUsingSessionDetails(cartDetails),
          ]);

          let paymentMethods = await resolvePaymentMethods();

          let response = {
            status: getStatusCode("failed"),
            message: getMessage("something_went_wrong_error", req.lang),
            data: {},
          };
          if (
            stateAndCityDetails &&
            stateAndCityDetails.length > 0 &&
            userCheckoutProducts &&
            userCheckoutProducts.length > 0 &&
            paymentMethods &&
            paymentMethods.length > 0
          ) {
            let modifiedCartDetails = [];

            cartDetails.forEach((cartDetail) => {
              for (let i = 0; i < userCheckoutProducts.length; i++) {
                let fetchedProductDetails = userCheckoutProducts[i];
                if (
                  fetchedProductDetails["size_id"] == cartDetail["sizeId"] &&
                  fetchedProductDetails["deal_id"] == cartDetail["dealId"]
                ) {
                  modifiedCartDetails.push({
                    ...cartDetail,
                    ...fetchedProductDetails,
                    item_quantity: cartDetail["quantity"],
                    item_id: cartDetail["item_id"],
                  });
                  break;
                }
              }
            });
            response = {
              status: getStatusCode("success"),
              message: "",
              data: {
                stateAndCities: stateAndCityDetails,
                products: modifiedCartDetails,
                userDetails: {},
                shippingCost: 0,
                cartId: sessionID,
                paymentMethods: paymentMethods,
                tax: siteSettings["tax_percentage"],
              },
            };
          }
          return res.send(response);
        } else {
          let response = {
            status: getStatusCode("failed"),
            message: getMessage("empty_cart", req.lang),
            data: {},
          };
          return res.send(response);
        }
      } else {
        let response = {
          status: getStatusCode("session_expired"),
          message: getMessage("session_expired", req.lang),
          data: {},
        };
        return res.send(response);
      }
    }

    let stateAndCityDetails = await getShippingStateCityInfo();
    let userCheckoutProducts = await getUserCheckoutDetails(
      userDetails.user_id
    );
    let userAddressDetails = await getUserAddDetails(userDetails.user_id);
    let paymentMethods = await resolvePaymentMethods();

    let siteSettings = await getSiteInfo();

    if (
      stateAndCityDetails.length > 0 &&
      userCheckoutProducts.length > 0 &&
      paymentMethods.length > 0
    ) {
      let shippingCost = 0;
      let cartId = userCheckoutProducts[0]["cart_id"];
      let addressDetails = userAddressDetails[0] ?? {};

      if (addressDetails["address1"] && stateAndCityDetails[0]?.cities) {
        for (let i = 0; i < stateAndCityDetails[0].cities.length; i++) {
          let city = stateAndCityDetails[0].cities[i];

          if (city.city_id === addressDetails["city_id"]) {
            shippingCost = city["delivery_charge"];
          }
        }
      }

      let response = {
        status: getStatusCode("success"),
        message: "",
        data: {
          stateAndCities: stateAndCityDetails,
          products: userCheckoutProducts,
          userDetails: addressDetails,
          shippingCost,
          cartId,
          paymentMethods: paymentMethods,
          tax: siteSettings["tax_percentage"],
        },
      };
      console.log("response : ", response);
      return res.send(response);
    } else {
      let response = {
        status: getStatusCode("failed"),
        message: getMessage("something_went_wrong_error", req.lang),
        data: {},
      };

      if (userCheckoutProducts.length <= 0) {
        response["message"] = getMessage("empty_cart", req.lang);
      } else if (!stateAndCityDetails.length) {
        response["message"] = getMessage("something_went_wrong_error", req.lang);
      }

      return res.send(response);
    }
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};

exports.validateCheckoutDetails = async (req, res, next) => {
  try {
    let newUser = false;
    let {
      productDetails,
      city,
      promocode,
      cartId,
      shippingCost,
      totalAmount,
      totalDiscount,
      discountType,
      discount,
      paymentMethod,
      finalTotal,
      totalTax,
      tax,
      phone_number,
      address,
      state,
      country,
    } = req.body;

    let { userDetails } = req;

    let sessionID = req.userSessionID;

    let response = {
      status: getStatusCode("failed"),
      message: getMessage("cart_not_found", req.lang),
      data: {},
    };

    if (!sessionID && !isValidUserDetails(userDetails)) {
      response["message"] = getMessage("try_again", req.lang);
      return res.send(response);
    }

    if (sessionID && !isValidUserDetails(userDetails)) {
      /* Check if the number and email already exists */
      let isPhoneNumberExists = await getUserProfileUsingPhoneNumber(
        phone_number
      );

      if (isPhoneNumberExists?.user_id) {
        if (!isPhoneNumberExists?.isGuestUser) {
          response["message"] = getMessage(
            "phone_already_exists_session",
            req.lang
          );
          return res.send(response);
        } else {
          let existingCartID = isPhoneNumberExists?.cartId;
          let removedExistingCartProducts = await removeExistingCartDetails(
            existingCartID,
            sessionID,
            isPhoneNumberExists
          );
          if (removedExistingCartProducts.status == 2) {
            response["status"] = getStatusCode("session_expired");
            response["message"] = getMessage("session_expired", req.lang);
            return res.send(response);
          } else if (removedExistingCartProducts.status == 2) {
            response["status"] = getStatusCode("failed");
            response["message"] = getMessage("try_again", req.lang);
            return res.send(response);
          }
        }
        userDetails = isPhoneNumberExists;
      } else {
        let password = generateRandomString();
        let requestData = {
          firstname: req.body.name,
          lastname: req.body.name,
          email: `GU${req.body.phone_number}@mail.com`,
          phone_number: req.body.phone_number,
          password: password,
          isGuestUser: 1,
          originalPassword: password,
          address: address,
          state,
          country,
          city,
        };
        let newUserResponse = await createUserAndMoveProductFromSession(
          requestData,
          sessionID
        );

        if (newUserResponse?.status) {
          userDetails = newUserResponse?.userInfo;
          newUser = true;
        } else {
          response["message"] = getMessage("try_again", req.lang);
          return res.send(response);
        }
      }
      let updatedCartProducts = [];
      let cartProducts = await getCartAndCartProductDetails(
        userDetails?.user_id
      );
      productDetails.forEach((product) => {
        for (let i = 0; i < cartProducts.length; i++) {
          let cartProduct = cartProducts[i];
          if (
            product.deal_id == cartProduct["deal_id"] &&
            product.sub_product_id == cartProduct["sub_product_id"]
          ) {
            updatedCartProducts.push({
              ...product,
              item_id: cartProduct["item_id"],
              cart_id: cartProduct["cart_id"],
            });
            cartId = cartProduct["cart_id"];
            req.body.cartId = cartProduct["cart_id"];
          }
        }
      });
      productDetails = updatedCartProducts;
    }

    if (!cartId || cartId == 0) {
      response["message"] = getMessage("cart_not_found", req.lang);
      return res.send(response);
    }

    let products = await getCartProducts(cartId, userDetails?.user_id);
    if (!products || products.length <= 0) {
      return res.send(response);
    }

    if (products?.length != productDetails?.length) {
      response["message"] = getMessage(
        "you_have_other_products_in_carts",
        req.lang
      );
      if (sessionID) {
        response["message"] = getMessage(
          "you_have_other_products_in_carts_session",
          req.lang
        );
      }
      return res.send(response);
    }

    let productsMap = {};

    /* Calculations */
    let totalPrice = Number(0);
    let totalCalculatedTax = 0;
    let totalShippingCost = 0;
    let promocodeDiscount = 0;

    products.forEach((product) => {
      productsMap[product.sub_product_id] = product;
    });

    for (let i = 0; i < productDetails.length; i++) {
      let checkoutProduct = productDetails[i];
      let product = productsMap[checkoutProduct["sub_product_id"]];
      if (!product) {
        response["message"] = getMessage(
          "you_have_other_products_in_carts",
          req.lang
        );
        return res.send(response);
      }

      if (product["quantity"] < checkoutProduct["item_quantity"]) {
        response["message"] = getMessage(
          "product_quantity_is_not_enough",
          req.lang
        ).replace("##PRODUCT_NAME##", product["deal_title"]);
        return res.send(response);
      }

      totalPrice +=
        Number(product["discount"]) * Number(checkoutProduct["item_quantity"]);
    }

    totalPrice = currencyFormatter(totalPrice);

    /* Get shipping cost */
    let cityShippingCost = await getCityShippingCost(city);
    if (cityShippingCost && cityShippingCost.length > 0) {
      totalShippingCost = currencyFormatter(
        cityShippingCost[0]["delivery_charge"]
      );
    }

    /* Validate promocode */
    if (
      promocode &&
      promocode != "" &&
      discount > 0 &&
      discountType &&
      discountType != ""
    ) {
      let promocodeDetails = await validatePromocode(promocode);
      if (promocodeDetails && promocodeDetails.length > 0) {
        promocodeDetails = promocodeDetails[0];
        if (
          promocodeDetails.minpromotype &&
          promocodeDetails.minimum_total > totalPrice
        ) {
          response["message"] = getMessage(
            "you_are_not_eligible_to_use_this_promocode",
            req.lang
          );
          return res.send(response);
        } else {
          promocodeDiscount = discountCalculator(
            promocodeDetails.type,
            promocodeDetails.discount,
            totalPrice
          );
          promocodeDiscount = currencyFormatter(promocodeDiscount);
        }
      }
    }
    let finalPrice = currencyFormatter(totalPrice - totalDiscount);

    let siteSettings = await getSiteInfo();
    if (siteSettings["tax_percentage"] && siteSettings["tax_percentage"] > 0) {
      totalCalculatedTax = discountCalculator(
        1,
        finalPrice,
        siteSettings["tax_percentage"]
      );
      finalPrice += totalCalculatedTax;
    }
    finalPrice += shippingCost;
    let isDHLShipment = 0;

    if (country && country != 254) {
      isDHLShipment = 1;
      totalShippingCost = shippingCost;
    }

    console.log("totalPrice : ", totalPrice);
    console.log("totalAmount : ", totalAmount);
    console.log("********************************************************");
    console.log("shippingCost : ", shippingCost);
    console.log("totalShippingCost : ", totalShippingCost);
    console.log("********************************************************");
    console.log("totalDiscount : ", totalDiscount);
    console.log("promocodeDiscount : ", promocodeDiscount);
    console.log("********************************************************");
    console.log("finalTotal : ", finalTotal);
    console.log("finalPrice : ", finalPrice);
    console.log("********************************************************");
    console.log("totalCalculatedTax : ", totalCalculatedTax);
    console.log("totalTax : ", totalTax);
    console.log("********************************************************");

    if (
      currencyFormatter(totalPrice) == currencyFormatter(totalAmount) &&
      // currencyFormatter(shippingCost) == currencyFormatter(totalShippingCost) &&
      currencyFormatter(totalDiscount) ==
        currencyFormatter(promocodeDiscount) &&
      currencyFormatter(finalTotal) == currencyFormatter(finalPrice) &&
      currencyFormatter(totalCalculatedTax) === currencyFormatter(totalTax)
    ) {
      let productIds = [];
      productDetails.forEach(function (product) {
        // "1-2-3-5-4" 1 -> deal_id, 2 -> sub_product_id, 3-> quantity, 4 -> price 5-> Item ID
        let productId =
          product.deal_id.toString() +
          "-" +
          product.sub_product_id.toString() +
          "-" +
          product.item_quantity.toString() +
          "-" +
          product?.item_id.toString() +
          "-" +
          +product.currentPrice.toString();
        productIds.push(productId);
      });

      // if (Number(paymentMethod) === -1 || Number(paymentMethod) === -2) {

      if (Number(paymentMethod) === -1) {
        let paymentId = `${userDetails?.user_id}00${getCurrentTimestamp()}`;
        let {
          status,
          message = "",
          transactionId = "",
        } = await updateCartTransactionDetails({
          productIds: productIds,
          promocode: promocode,
          discount: req.body?.discount,
          discount_type: req.body?.discountType,
          cart_id: cartId,
          totalShippingCost: totalShippingCost,
          totalDiscount: promocodeDiscount,
          grandTotal: finalPrice,
          subTotal: totalPrice,
          paymentId: paymentId,
          paymentMethod: paymentMethod,
          id: paymentId,
          requestData: req.body,
          sessionID: sessionID,
          isDHLShipment: isDHLShipment,
        });

        if (status === 1) {
          if (!sessionID || sessionID == "") {
            sendOrderSuccessEmail(transactionId, userDetails, req.lang);
            let adminEmail = await getAdminEmail();
            sendOrderSuccessEmailToAdmin(transactionId, adminEmail, req.lang);
          }
          response["status"] = getStatusCode("order_placed_cod");
          response["message"] = getMessage("your_order_is_created", req.lang);
        } else if (status === -1) {
          response["message"] = message;
        } else {
          response["message"] = getMessage("try_again", req.lang);
        }
      } else {
        let paymentDetails = {
          PaymentMethodId: Number(paymentMethod),
          InvoiceValue: finalPrice,
          CustomerMobile: userDetails.phone_number,
          CustomerEmail: userDetails.email,
          Language: "EN",
          CallBackUrl: PAYMENT_SUCCESS_URL,
          ErrorUrl: PAYMENT_FAILED_URL,
          CustomerReference: userDetails.user_id,
          CustomerAdress: { Address: req.body?.address },
          userDefinedField: JSON.stringify({
            promocode: req.body?.promocode,
            discount: req.body?.discount,
            discount_type: req.body?.discountType,
            productIds: productIds,
            cart_id: req.body?.cartId,
            totalShippingCost: totalShippingCost,
            totalDiscount: promocodeDiscount,
            grandTotal: finalPrice,
            subTotal: totalPrice,
            tax: tax,
            totalTax: totalTax,
            paymentMethod: Number(paymentMethod),
            sessionID: sessionID ? sessionID : "",
            isPickupFromStore: req?.body?.isPickupFromStore
              ? req?.body?.isPickupFromStore
              : 0,
            shippingDetails: `${req.body.country}-${req.body.state}-${req.body.city}`,
          }),
        };

        let paymentResponse = await executePaymentDetails(paymentDetails);
        if (paymentResponse?.IsSuccess) {
          await updateCartCheckoutDetails(req.body);

          response["status"] = getStatusCode("success");
          response["message"] = "";
          response["data"] = { paymentURL: paymentResponse.Data.PaymentURL };
        } else {
          response["message"] = getMessage("try_again", req.lang);
        }
      }
    } else {
      response["message"] = getMessage("total_error", req.lang);
      return res.send(response);
    }

    return res.send(response);
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};

exports.getPaymentStatus = async (req, res, next) => {
  try {
    /* 
      1 -> Success
      0 -> False
    */
    let { paymentId, type } = req.body;
    let { userDetails } = req;

    let response = {
      status: getStatusCode("failed"),
      message: getMessage("try_again", req.lang),
      data: {},
    };

    if (type) {
      let paymentResponse = await validatePaymentStatus(paymentId);
      if (paymentResponse && paymentResponse?.IsSuccess) {
        let paymentDetail = paymentResponse?.Data;

        if (paymentDetail?.InvoiceStatus === "Paid") {
          let cartDetails = paymentDetail?.UserDefinedField;
          let customerReferenceNumber = paymentDetail?.CustomerReference;
          let transactionDetails = paymentDetail?.InvoiceTransactions;

          cartDetails = JSON.parse(cartDetails);
          transactionDetails = transactionDetails[0]
            ? transactionDetails[0]
            : {};
          cartDetails["user_id"] = customerReferenceNumber;

          let {
            status,
            message = "",
            transactionId = "",
          } = await updateCartTransactionDetails({
            ...cartDetails,
            ...transactionDetails,
            ...req.body,
          });

          if (status === 1) {
            if (
              cartDetails &&
              (!cartDetails.sessionID || cartDetails.sessionID == "")
            ) {
              sendOrderSuccessEmail(transactionId, userDetails, req.lang);
            }
            response["status"] = getStatusCode("success");
            response["message"] = getMessage("your_order_is_created", req.lang);
            return res.send(response);
          } else if (status === -1) {
            response["message"] = message;
          } else {
            response["message"] = getMessage("try_again", req.lang);
          }
        }

        if (paymentDetail?.InvoiceStatus === "Pending") {
          response["message"] = getMessage("transaction_in_pending", req.lang);
          return res.send(response);
        }

        if (paymentDetail?.InvoiceStatus === "Canceled") {
          response["message"] = getMessage(
            "transaction_is_cancelled",
            req.lang
          );
          return res.send(response);
        }
      } else {
        response["message"] = getMessage("refresh_the_page", req.lang);
      }
    } else {
      response["status"] = getStatusCode("success");
      response["message"] = getMessage("payment_failed", req.lang);
    }

    return res.send(response);
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};

exports.initiateTabbyPayment = async (req, res, next) => {
  const paymentData = req.body;

  const SECRET_API_KEY = process.env.SECRET_API_KEY;
  const PUBLIC_API_KEY = process.env.PUBLIC_API_KEY;

  try {
    const response = await axios.post(
      "https://api.tabby.ai/api/v2/checkout",
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${PUBLIC_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let paymentId = response.data.id;
    let webUrl = response.data.configuration.available_products.installments
      ? response.data.configuration.available_products.installments[0].web_url
      : "";

    res.status(200).json({
      success: true,
      paymentURL: response.data.paymentURL,
      webURL: webUrl,
    });
  } catch (error) {
    console.error(
      "Error initiating Tabby payment:",
      error.response ? error.response.data : error.message
    );

    res.status(500).json({
      success: false,
      errorMessage: error.response
        ? error.response.data.message
        : error.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  const payment_id = req.query.payment_id;
  let sessionID = req.userSessionID;

  const SECRET_API_KEY = process.env.SECRET_API_KEY;

  try {
    const response = await axios.get(
      `https://api.tabby.ai/api/v2/payments/${payment_id}`,
      {
        headers: {
          Authorization: `Bearer ${SECRET_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    let paymentStatus = response.data.status;
    let tabby_installment_count = response.data.product.installments_count;
    let tabby_installment_period = response.data.product.installment_period;
    let tamara_payment_mode = "";
    let tamara_payment_status = "";
    let tamara_instalments_count = 0;

    if (paymentStatus === "AUTHORIZED") {
      await capturePayment(payment_id, String(response.data.amount));
    }
    let isDHLShipment = 0;
    if (paymentStatus === "CLOSED") {
      const requestData = response.data.meta.requestData;
      requestData.paymentId = payment_id;
      requestData.tabby_installment_count = tabby_installment_count;
      requestData.tabby_installment_period = tabby_installment_period;
      requestData.tabby_payment_status = paymentStatus;
      requestData.sessionID = sessionID;
      requestData.tamara_payment_mode = tamara_payment_mode;
      requestData.tamara_payment_status = tamara_payment_status;
      requestData.tamara_instalments_count = tamara_instalments_count;
      requestData.isDHLShipment = isDHLShipment;
      if (requestData.country && requestData.country != 254) {
        requestData.isDHLShipment = 1;
      }

      await updateCartTransactionDetailsTabby(requestData);
      await updateTabbyCartDetails(requestData);
    }

    res.status(200).json({ status: paymentStatus });
  } catch (error) {
    console.error(
      "Error verifying payment:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ errorMessage: error.message });
  }
};

exports.registerWebhook = async (req, res, next) => {
  const SECRET_API_KEY = process.env.SECRET_API_KEY;
  const MERCHANT_CODE = process.env.MERCHANT_CODE;
  const webhookUrl =
    "https://8bbf-2401-4900-1ce2-e74-8e1b-ad76-9a7a-fc2e.ngrok-free.app/api/checkout/webhooks/tabby";

  try {
    const response = await axios.post(
      "https://api.tabby.ai/api/v1/webhooks",
      {
        url: webhookUrl,
        is_test: true,
      },
      {
        headers: {
          Authorization: `Bearer ${SECRET_API_KEY}`,
          "Content-Type": "application/json",
          "X-Merchant-Code": MERCHANT_CODE,
        },
      }
    );
  } catch (error) {
    console.error(
      "Error registering webhook:",
      error.response ? error.response.data : error.message
    );
  }
};

exports.handleTabbyWebhook = async (req, res, next) => {
  const SECRET_API_KEY = process.env.SECRET_API_KEY;
  const requestAuthorizationHeader = req.headers["authorization"];
  const expectedAuthorizationHeader = `Bearer ${process.env.SECRET_API_KEY}`;

  if (requestAuthorizationHeader !== expectedAuthorizationHeader) {
    console.error("Invalid authorization header:", requestAuthorizationHeader);
    return res.status(401).send("Unauthorized");
  }
  const payload = JSON.stringify(req.body);

  const event = req.body;

  try {
    switch (event.status) {
      case "authorized":
        await capturePayment(event.id, event.amount);
        break;
      case "closed":
        updateOrderDetails(event);
        break;
      case "rejected":
        await handleRejectedEvent(event);
        break;
      case "expired":
        await handleExpiredEvent(event);
        break;
      default:
        console.log(`Unhandled event status: ${event.status}`);
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Capture Payment function
const capturePayment = async (payment_id, amount) => {
  const SECRET_API_KEY = process.env.SECRET_API_KEY;

  try {
    const response = await axios.post(
      `https://api.tabby.ai/api/v2/payments/${payment_id}/captures`,
      { amount },
      {
        headers: {
          Authorization: `Bearer ${SECRET_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
    }
  } catch (error) {
    if (error.response) {
      console.error("Error capturing payment:", error.response.data);
    } else if (error.request) {
      console.error(
        "Error capturing payment, no response received:",
        error.request
      );
    } else {
      console.error("Error capturing payment:", error.message);
    }
  }
};

const updateOrderDetails = async (event) => {
  const paymentId = event.id;
  const SECRET_API_KEY = process.env.SECRET_API_KEY;

  try {
    const response = await axios.get(
      `https://api.tabby.ai/api/v2/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${SECRET_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    let paymentStatus = response.data.status;

    if (!response) {
      throw new Error("Unable to fetch payment details");
    }
    let installments_count = response.data.product.installments_count;
    let installment_period = response.data.product.installment_period;
    let status = event.status;
    await updateTabbyInstallmentDetails(
      installments_count,
      installment_period,
      status,
      paymentId
    );
  } catch (error) {
    console.error("Error updating order details:", error);
  }
};

const handleRejectedEvent = async (event) => {
  const paymentId = event.id;
  const SECRET_API_KEY = process.env.SECRET_API_KEY;

  try {
    const response = await axios.get(
      `https://api.tabby.ai/api/v2/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${SECRET_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    let paymentStatus = response.data.status;

    // res.status(200).json({ response });

    if (!response) {
      throw new Error("Unable to fetch payment details");
    }
    let installments_count = response.data.product.installments_count;
    let installment_period = response.data.product.installment_period;
    let status = event.status;

    await updateTabbyInstallmentDetails(
      installments_count,
      installment_period,
      status,
      paymentId
    );
  } catch (error) {
    console.error("Error updating order details:", error);
  }
};

const handleExpiredEvent = async (event) => {
  const paymentId = event.id;
  const SECRET_API_KEY = process.env.SECRET_API_KEY;

  try {
    const response = await axios.get(
      `https://api.tabby.ai/api/v2/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${SECRET_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    let paymentStatus = response.data.status;

    // res.status(200).json({ response });

    if (!response) {
      throw new Error("Unable to fetch payment details");
    }
    let installments_count = response.data.product.installments_count;
    let installment_period = response.data.product.installment_period;
    let status = event.status;
    await updateTabbyInstallmentDetails(
      installments_count,
      installment_period,
      status,
      paymentId
    );
  } catch (error) {
    console.error("Error updating order details:", error);
  }
};

const verifyTamaraToken = (token) => {
  const TAMARA_NOTIFICATION_TOKEN = process.env.TAMARA_NOTIFICATION_TOKEN;
  console.log("TAMARA_NOTIFICATION_TOKEN:", TAMARA_NOTIFICATION_TOKEN);
  logger.info(TAMARA_NOTIFICATION_TOKEN);

  try {
    logger.info("entered into the vertify token funcction");
    const decoded = jwt.verify(token, TAMARA_NOTIFICATION_TOKEN, {
      algorithms: ["HS256"],
    });
    console.log("Decoded Token:", decoded);
    logger.info(decoded);

    return decoded;
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    logger.error("JWT verification failed :", err.message);
    throw new Error("Invalid Tamara token");
  }
};

exports.createTamaraSesson = async (req, res, next) => {
  const paymentData = req.body;
  console.log("paymentData : ", paymentData);
  paymentData["order_reference_id"] = getUUID();
  const TAMARA_API_TOKEN = process.env.TAMARA_API_TOKEN;

  try {
    const response = await axios.post(
      "https://api-sandbox.tamara.co/checkout",
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${TAMARA_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("response of the create session api :  ", response);
    const webUrl = response.data.checkout_url || "";
    console.log("webUrl : ", webUrl);
    logger.info(webUrl);

    res.status(200).json({
      success: true,
      paymentURL: response.data.paymentURL,
      webURL: webUrl,
    });
  } catch (error) {
    console.error(
      "Error initiating Tabby payment:",
      error.response ? error.response.data : error.message
    );

    res.status(500).json({
      success: false,
      errorMessage: error.response
        ? error.response.data.message
        : error.message,
    });
  }
};

// https://ecomapi.indiprotechnologies.com/api/checkoutTest/tamara-webhook
// https://ecomapi.indiprotechnologies.com/api/checkoutTest/tamara-webhook

exports.sendOrderStaus = async (req, res, next) => {
  const { payment_id } = req.body;

  const TAMARA_API_TOKEN = process.env.TAMARA_API_TOKEN;
  try {
    const response = await axios.get(
      `https://api-sandbox.tamara.co/orders/${payment_id}`,
      {
        headers: {
          Authorization: `Bearer ${TAMARA_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    let paymentStatus = response.data.status;

    // await AuthorisePayment(payment_id, null);

    res.status(200).json({ status: paymentStatus });
  } catch (error) {
    console.error("erorr : ", error.response);
    console.error(
      "Error verifying payment:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ errorMessage: error.message });
  }
};

const getOrderStatus = async (orderId) => {
  const TAMARA_API_TOKEN = process.env.TAMARA_API_TOKEN;

  try {
    const response = await axios.get(
      `https://api-sandbox.tamara.co/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${TAMARA_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response;
  } catch (error) {
    console.error(
      "Error fetching order status:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Error fetching order status");
  }
};

const AuthorisePayment = async (paymentId, sessionID) => {
  // const TAMARA_API_TOKEN = process.env.TAMARA_API_TOKEN;
  const TAMARA_API_TOKEN =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhY2NvdW50SWQiOiIxYjgyYWMzNi01YjdlLTRjNDYtYjJkNS1lMmEwOGM4MWQ1MzUiLCJ0eXBlIjoibWVyY2hhbnQiLCJzYWx0IjoiZmE0OGEyNTQ3YzE3MjhiMGY3MzhhOTJjZmU0ZjM5MDIiLCJyb2xlcyI6WyJST0xFX01FUkNIQU5UIl0sImlhdCI6MTcxNjI5MTcwNSwiaXNzIjoiVGFtYXJhIn0.QjmtHRN9nY5QYXh7CJQatWCEO_YON1cWrX-Gz1y7KSGjd1zIQzSg2pvXu9jFIrG2SMSRRcyd-Er0U6IpcBwbenv3SYVSShRVDzX2j3lXdenpX-t0nJXgWjdWv9l9FZrGiKOpUcurzg6fos6qFP1_d6l16gmqbTkTI2-QCRb19DEMVHPN9CzypbOpkm2FvLPu2fRU9aJaynAEoe-ixTHsbjectTXlhcwt87UOTqFwsmxz4LZ6C3ylkvbodruJEpQypCwex-xMLIFxsmfSzPGilt52mAGewimIz8mXdJkK1tHEoN9XGB6-lB3SL75MFVneqB26c3KoKa8SKZU9pEHtFg";

  try {
    const response = await axios.post(
      `https://api-sandbox.tamara.co/orders/${paymentId}/authorise`,
      {},
      {
        headers: {
          Authorization: `Bearer ${TAMARA_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(
      "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$AuthorisePayment$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$4"
    );
    console.log("response of the AuthorisePayment API : ", response.data);
    const paymentStatus = response.data.status;
    let isDHLShipment = 0;

    if (paymentStatus === "authorised") {
      const getRequestData = await getOrderStatus(paymentId);

      const requestData = getRequestData.data.additional_data;
      requestData.paymentId = paymentId;
      requestData.tamara_payment_mode = getRequestData.data.payment_type;
      requestData.tamara_instalments_count = getRequestData.data.instalments;
      requestData.tamara_payment_status = getRequestData.data.status;
      requestData.sessionID = sessionID;
      requestData.tabby_installment_count = 0;
      requestData.tabby_installment_period = "";
      requestData.tabby_payment_status = "";

      console.log(
        " requestData requestData requestData requestData requestData requestData requestData requestData requestData requestData requestData"
      );
      console.log("^^^^requestData^^^^^ : ", requestData);
      console.log("requestData COUNTRY : ", requestData.country);
      console.log(
        " requestData requestData requestData requestData requestData requestData requestData requestData requestData requestData requestData"
      );
      requestData.isDHLShipment = isDHLShipment;
      if (requestData.country && requestData.country != 254) {
        requestData.isDHLShipment = 1;
      }

      await updateCartTransactionDetailsTabby(requestData);
      await updateTabbyCartDetails(requestData);

      const captureData = {
        order_id: paymentId,
        total_amount: getRequestData.data.total_amount,
        shipping_info: getRequestData.data.shipping_address,
        items: getRequestData.data.items,
      };

      try {
        await captureOrder(paymentId, captureData);
      } catch (error) {
        console.error(
          "Error capturing order:",
          error.response ? error.response.data : error.message
        );
        throw new Error("Error capturing order: " + error.message);
      }
    }

    return { status: paymentStatus };
  } catch (error) {
    console.error("Error verifying payment:", error.response);
    console.error(
      "Error verifying payment:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Error verifying payment: " + error.message);
  }
};

const captureOrder = async (payment_id, captureData) => {
  const TAMARA_API_TOKEN = process.env.TAMARA_API_TOKEN;
  try {
    const response = await axios.post(
      `https://api-sandbox.tamara.co/payments/capture`,
      captureData,
      {
        headers: {
          Authorization: `Bearer ${TAMARA_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(
      "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$captureOrder$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$4"
    );
    console.log("response of the captureOrder API : ", response.data);

    if (response.status === 200) {
    }
  } catch (error) {
    if (error.response) {
      console.error("Error capturing payment:", error.response.data);
    } else if (error.request) {
      console.error(
        "Error capturing payment, no response received:",
        error.request
      );
    } else {
      console.error("Error capturing payment:", error.message);
    }
  }
};

exports.registerTamaraWebhook = async (req, res, next) => {
  const TAMARA_API_TOKEN = process.env.TAMARA_API_TOKEN;
  const webhookUrl =
    "https://6313-2401-4900-8827-5716-4672-d827-138e-d264.ngrok-free.app/api/checkoutTest/tamara-webhook";

  try {
    const response = await axios.post(
      "https://api-sandbox.tamara.co/webhooks",
      {
        url: webhookUrl,
        events: [
          "order_approved",
          "order_authorised",
          "order_declined",
          "order_canceled",
          "order_captured",
          "order_expired",
          "order_refunded",
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${TAMARA_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "Error registering webhook:",
      error.response ? error.response.data : error.message
    );
  }
};

exports.handleTamaraWekhook = async (req, res, next) => {
  console.log("callingggggggggggggggg tamaraaaaaaaaaaaa  handleTamaraWekhook");
  logger.info("callingggggggggggggggg tamaraaaaaaaaaaaa  handleTamaraWekhook");
  let sessionID = req.userSessionID;

  const tamaraToken = req.query.tamaraToken;
  console.log("TAMARA TOKEN : ", tamaraToken);
  logger.info(tamaraToken);

  if (!tamaraToken) {
    logger.info("TAMARA TOKEN is missing ");

    return res.status(401).send("Authorization token missing");
  }

  try {
    verifyTamaraToken(tamaraToken);

    const event = req.body;

    console.log(" event : ", event);
    logger.info(event);

    let paymentId = event.order_id;
    switch (event.order_status || event.event_type) {
      case "approved":
      case "order_approved":
        console.log("Order approved:", event);
        logger.info(event);

        console.log("enter from webhook to auth 1");
        logger.info("enter from webhook to auth 1");
        await AuthorisePayment(paymentId, sessionID);
        console.log("enter from webhook to auth 2");
        logger.info("enter from webhook to auth 2");
        break;

      case "declined":
      case "order_declined":
        console.log("Order declined:", event);
        await handleDeclinedWebhook(event);
        break;

      case "authorised":
      case "order_authorised":
        console.log("Order authorised:", event);
        await handleAuthorisedWebhook(event);
        break;

      case "canceled":
      case "order_canceled":
        console.log("Order cancelled:", event);
        await handleCanceledWebhook(event);
        break;

      case "fully_captured":
      case "order_captured":
        console.log("Order captured:", event);
        await handleFullyCapturedWebhook(event);
        break;

      case "partially_captured":
        console.log("Order partially captured:", event);
        await handlePartiallyCapturedWebhook(event);
        break;

      case "expired":
      case "order_expired":
        console.log("Order expired:", event);
        await handleExpiredWebhook(event);
        break;

      default:
        console.log(
          "Unhandled event type:",
          event.order_status || event.event_type
        );
    }

    res.status(200).send("Event received");
  } catch (error) {
    console.error("Error processing webhook:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
const handleDeclinedWebhook = async (event) => {
  let paymentId = event.order_id;
  const TAMARA_API_TOKEN = process.env.TAMARA_API_TOKEN;

  try {
    const getRequestData = await axios.get(
      `https://api-sandbox.tamara.co/orders/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${TAMARA_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response) {
      throw new Error("Unable to fetch payment details");
    }

    let installments_count = getRequestData.data.instalments;
    let installment_period = getRequestData.data.payment_type;
    let status = event.status;

    await updateTamaraInstallmentDetails(
      installments_count,
      installment_period,
      status,
      paymentId
    );
  } catch (error) {
    console.error("Error updating order details:", error);
  }
};
const handleAuthorisedWebhook = async (event) => {
  let paymentId = event.order_id;
  const TAMARA_API_TOKEN = process.env.TAMARA_API_TOKEN;

  try {
    const getRequestData = await axios.get(
      `https://api-sandbox.tamara.co/orders/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${TAMARA_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!getRequestData) {
      throw new Error("Unable to fetch payment details");
    }

    let installments_count = getRequestData.data.instalments;
    let installment_period = getRequestData.data.payment_type;
    let status = event.status;

    await updateTamaraInstallmentDetails(
      installments_count,
      installment_period,
      status,
      paymentId
    );
  } catch (error) {
    console.error("Error updating order details:", error);
  }
};
const handleCanceledWebhook = async (event) => {
  let paymentId = event.order_id;
  const TAMARA_API_TOKEN = process.env.TAMARA_API_TOKEN;

  try {
    const getRequestData = await axios.get(
      `https://api-sandbox.tamara.co/orders/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${TAMARA_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response) {
      throw new Error("Unable to fetch payment details");
    }

    let installments_count = getRequestData.data.instalments;
    let installment_period = getRequestData.data.payment_type;
    let status = event.status;

    await updateTamaraInstallmentDetails(
      installments_count,
      installment_period,
      status,
      paymentId
    );
  } catch (error) {
    console.error("Error updating order details:", error);
  }
};
const handleFullyCapturedWebhook = async (event) => {
  let paymentId = event.order_id;
  const TAMARA_API_TOKEN = process.env.TAMARA_API_TOKEN;

  try {
    const getRequestData = await axios.get(
      `https://api-sandbox.tamara.co/orders/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${TAMARA_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!getRequestData) {
      throw new Error("Unable to fetch payment details");
    }

    let installments_count = getRequestData.data.instalments;
    let installment_period = getRequestData.data.payment_type;
    let status = event.status;

    await updateTamaraInstallmentDetails(
      installments_count,
      installment_period,
      status,
      paymentId
    );
  } catch (error) {
    console.error("Error updating order details:", error);
  }
};
const handlePartiallyCapturedWebhook = async (event) => {
  let paymentId = event.order_id;
  const TAMARA_API_TOKEN = process.env.TAMARA_API_TOKEN;

  try {
    const getRequestData = await axios.get(
      `https://api-sandbox.tamara.co/orders/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${TAMARA_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response) {
      throw new Error("Unable to fetch payment details");
    }

    let installments_count = getRequestData.data.instalments;
    let installment_period = getRequestData.data.payment_type;
    let status = event.status;

    await updateTamaraInstallmentDetails(
      installments_count,
      installment_period,
      status,
      paymentId
    );
  } catch (error) {
    console.error("Error updating order details:", error);
  }
};
const handleExpiredWebhook = async (event) => {
  let paymentId = event.order_id;
  const TAMARA_API_TOKEN = process.env.TAMARA_API_TOKEN;

  try {
    const getRequestData = await axios.get(
      `https://api-sandbox.tamara.co/orders/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${TAMARA_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response) {
      throw new Error("Unable to fetch payment details");
    }

    let installments_count = getRequestData.data.instalments;
    let installment_period = getRequestData.data.payment_type;
    let status = event.status;

    await updateTamaraInstallmentDetails(
      installments_count,
      installment_period,
      status,
      paymentId
    );
  } catch (error) {
    console.error("Error updating order details:", error);
  }
};

// DHL
exports.fetchSubProductDimensions = async (req, res, next) => {
  try {
    const subProductIds = req.body;
    console.log("req.body: ", subProductIds);

    const response = await fetchDimensionsFromService(subProductIds);
    console.log("Dimension response: ", response);
    return res.send(response);
  } catch (error) {
    console.error("Error fetching product dimensions:", error);
    return res.status(500).send({
      message: "An error occurred while fetching product dimensions.",
    });
  }
};

exports.DHLRating = async (req, res, next) => {
  try {
    const requestData = req.query;
    console.log("req.body: ", requestData);

    const dhlRatingApiUrl = `https://express.api.dhl.com/mydhlapi/rates?accountNumber=${requestData.accountNumber}&originCountryCode=${requestData.originCountryCode}&originCityName=${requestData.originCityName}&destinationCountryCode=${requestData.destinationCountryCode}&destinationCityName=${requestData.destinationCityName}&weight=${requestData.weight}&length=${requestData.length}&width=${requestData.width}&height=${requestData.height}&plannedShippingDate=${requestData.plannedShippingDate}&isCustomsDeclarable=${requestData.isCustomsDeclarable}&unitOfMeasurement=${requestData.unitOfMeasurement}`;

    // const dhlRatingApiUrl = `https://express.api.dhl.com/mydhlapi/test/rates?accountNumber=${requestData.accountNumber}&originCountryCode=${requestData.originCountryCode}&originCityName=${requestData.originCityName}&destinationCountryCode=${requestData.destinationCountryCode}&destinationCityName=${requestData.destinationCityName}&weight=${requestData.weight}&length=${requestData.length}&width=${requestData.width}&height=${requestData.height}&plannedShippingDate=${requestData.plannedShippingDate}&isCustomsDeclarable=${requestData.isCustomsDeclarable}&unitOfMeasurement=${requestData.unitOfMeasurement}`;
    https: console.log("enter into the after api");

    const dhlResponse = await axios.get(dhlRatingApiUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic YXBHMWhJMHVFMmdKM3M6UyM2b0IjMWROITluS0A4YQ==",
      },
    });

    let responseData = dhlResponse.data.products;
    console.log("responseData : ", responseData);

    const product = responseData.find((p) => p.productCode === "P");
    console.log("product  : ", product);

    if (product) {
      const priceInAED = product.totalPrice.find(
        (priceObj) => priceObj.priceCurrency === "AED"
      ).price;
      console.log("Price in AED:", priceInAED);
      return res.status(200).send({ priceInAED });
    }
  } catch (error) {
    console.error("Error DHL Rating calculation:", error);

    return res.status(500).send({
      message: error,
    });
  }
};

// DHL webhook

exports.handleDHLWebhook = async (req, res) => {
  console.log(
    "##################################### DHL  WEBHOOK ################################################################################################3"
  );
  try {
    const webhookData = req.body;
    console.log("webhookData : ", webhookData);

    if (
      !webhookData ||
      !webhookData.shipments ||
      webhookData.shipments.length === 0
    ) {
      return res.status(400).json({ message: "Invalid webhook data" });
    }

    for (const shipment of webhookData.shipments) {
      const trackingNumber = shipment.shipmentTrackingNumber;
      const events = shipment.events || [];
      console.log("trackingNumber : ", trackingNumber);
      console.log("events : ", events);

      for (const event of events) {
        const eventCode = event.typeCode;
        const eventDescription = event.description;
        const eventDate = event.date;
        const eventTime = event.time;
        console.log("eventDescription : ", eventDescription);
        console.log("eventDate : ", eventDate);
        console.log("eventTime : ", eventTime);

        let shipmentStatus;
        switch (eventCode) {
          case "AR":
            shipmentStatus = "Arrival in delivery facility";
            break;

          case "BA":
            shipmentStatus = "Bad address";
            break;

          case "DD":
            shipmentStatus = "Delivered damaged";
            break;

          case "ND":
            shipmentStatus = "Not Delivered";
            break;

          case "OH":
            shipmentStatus = "On Hold";
            break;

          case "OK":
            shipmentStatus = "Delivery";
            break;

          case "PD":
            shipmentStatus = "Partial delivery";
            break;

          case "PU":
            shipmentStatus = "Partial delivery";
            break;

          case "PD":
            shipmentStatus = "Shipment pick-up";
            break;

          case "PD":
            shipmentStatus = "Partial delivery";
            break;

          case "RD":
            shipmentStatus = "Refused delivery";
            break;

          case "SA":
            shipmentStatus = "Shipment acceptance";
            break;

          case "SS":
            shipmentStatus = "Shipment stopped";
            break;

          case "UD":
            shipmentStatus = "Uncontrollable delay";
            break;

          case "PY":
            shipmentStatus = "Payment";
            break;

          case "SD":
            shipmentStatus = "Shipment information received";
            break;

          case "SM":
            shipmentStatus = "Scheduled movement";
            break;

          case "PL":
            shipmentStatus = "Processed at location";
            break;

          case "AD":
            shipmentStatus = "Agreed delivery";
            break;

          case "CD":
            shipmentStatus = "Controllable delay";
            break;

          case "DS":
            shipmentStatus = "Destroyed / disposal";
            break;

          case "HP":
            shipmentStatus = "Held for payment";
            break;

          case "NH":
            shipmentStatus = "customer not in home";
            break;

          default:
            shipmentStatus = eventCode;
        }

        await DHLShipmentEvent(
          trackingNumber,
          shipmentStatus,
          eventDescription,
          eventDate,
          eventTime
        );
      }
    }

    return res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error handling DHL Webhook:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
