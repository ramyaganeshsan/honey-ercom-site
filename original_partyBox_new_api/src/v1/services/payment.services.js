const {
  stringifyData,
  getValueFromRedis,
  setValueRedis,
  parseData,
} = require("../utils");
const { PAYMENT_GATEWAY_BASE_URL } = require("../utils/constants");
const logger = require("../utils/logger");
const axios = require("axios");

let token = process.env.TOKEN;
let currencyIso = "AED";
let headers = {
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

/** Local/dev fallback when MyFatoorah TOKEN is missing or InitiatePayment fails. */
const FALLBACK_PAYMENT_METHODS = [
  {
    PaymentMethodId: 6,
    PaymentMethodAr: "البطاقات المدينة/الدائنة",
    PaymentMethodEn: "Debit/Credit Cards",
    PaymentMethodCode: "uaecc",
    IsDirectPayment: false,
    ServiceCharge: 0,
    TotalAmount: 0,
    CurrencyIso: "AED",
    ImageUrl: "https://portal.myfatoorah.com/imgs/payment-methods/uaecc.png",
    IsEmbeddedSupported: true,
    PaymentCurrencyIso: "AED",
  },
];

exports.getFallbackPaymentMethods = () => FALLBACK_PAYMENT_METHODS;

exports.PaymentMethodsDetails = async () => {
  // MyFatoorah InitiatePayment disabled — return local fallback so checkout opens.
  // Re-enable the block below when TOKEN is configured.
  return FALLBACK_PAYMENT_METHODS;

  /*
  console.log(
    "caling ---------------------------------------------------------------------------------------"
  );
  let paymentMethods = await getValueFromRedis("paymentMethods");
  if (paymentMethods) {
    let parsedResponse = parseData(paymentMethods);
    if (parsedResponse?.status) {
      const cached = parsedResponse?.data;
      if (Array.isArray(cached) && cached.length > 0) return cached;
    }
  }

  if (!token || !String(token).trim()) {
    logger.warn("MyFatoorah TOKEN is empty; using fallback payment methods");
    return FALLBACK_PAYMENT_METHODS;
  }

  try {
    let url = `${PAYMENT_GATEWAY_BASE_URL}/v2/InitiatePayment`;
    let data = {
      InvoiceAmount: 0,
      CurrencyIso: currencyIso,
    };
    let response = await axios.post(url, data, {
      headers: headers,
    });

    if (response && response.data && response.data["IsSuccess"]) {
      const methods = response.data["Data"]["PaymentMethods"] || [];
      if (methods.length > 0) {
        let stringifyResponse = stringifyData(methods);
        if (stringifyResponse?.status) {
          await setValueRedis("paymentMethods", stringifyResponse.data, 86400);
        }
        return methods;
      }
    }

    logger.warn("MyFatoorah returned no payment methods; using fallback");
    return FALLBACK_PAYMENT_METHODS;
  } catch (err) {
    console.log(err.message);
    logger.error(err);
    return FALLBACK_PAYMENT_METHODS;
  }
  */
};

exports.executePaymentDetails = async (paymentDetails) => {
  try {
    paymentDetails["DisplayCurrencyIso"] = currencyIso;
    let url = `${PAYMENT_GATEWAY_BASE_URL}/v2/ExecutePayment`;
    let response = await axios.post(url, paymentDetails, { headers: headers });
    return response && response?.data ? response?.data : {};
  } catch (err) {
    console.log(err);
    logger.error(err);
    return {};
  }
};

exports.validatePaymentStatus = async (paymentId) => {
  try {
    let url = `${PAYMENT_GATEWAY_BASE_URL}/v2/GetPaymentStatus`;
    let paymentDetails = {
      Key: paymentId,
      KeyType: "paymentid",
    };
    let response = await axios.post(url, paymentDetails, { headers: headers });
    return response && response?.data ? response?.data : {};
  } catch (err) {
    console.log(err);
    logger.error(err);
    return {};
  }
};
