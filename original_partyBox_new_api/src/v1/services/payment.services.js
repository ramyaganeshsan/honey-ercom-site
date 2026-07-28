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

exports.PaymentMethodsDetails = async () => {
  console.log(
    "caling ---------------------------------------------------------------------------------------"
  );
  let paymentMethods = await getValueFromRedis("paymentMethods");
  if (paymentMethods) {
    let parsedResponse = parseData(paymentMethods);
    if (parsedResponse?.status) return parsedResponse?.data;
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
      let stringifyResponse = stringifyData(
        response.data["Data"]["PaymentMethods"]
      );
      if (stringifyResponse?.status) {
        await setValueRedis("paymentMethods", stringifyResponse.data, 86400);
      }
      return response.data["Data"]["PaymentMethods"];
    }

    return [];
  } catch (err) {
    console.error(
      ")))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))0"
    );
    console.error("error : ", err);
    console.error(
      "))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))"
    );
    console.log(err.message);
    logger.error(err);
    return [];
  }
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
