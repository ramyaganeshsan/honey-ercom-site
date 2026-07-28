import { useContext, useEffect, useLayoutEffect, useState } from "react";
import BreadCrumb from "../../components/utils/breadcrumb";
import { t } from "i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  useCreateTamaraSessonMutation,
  useFetchSubProductDimensionsMutation,
  useGetCheckoutDetailsMutation,
  useInitiateTabbyPaymentMutation,
  useRegisterTabbywebhookMutation,
  useValidateCheckoutDetailsMutation,
  useGetDHLShippingCostMutation,
} from "../../rtk/networkcalls/checkout.query";
import { useValidatePromocodeMutation } from "../../rtk/networkcalls/promocode.query";
import Spinner from "../../components/utils/spinner";
import {
  calculateProductTotalPrice,
  currencyFormatter,
  getUserInfo,
  getWordBasedOnLanguage,
  handleResponse,
  toastConfig,
} from "../../utils";
import { toast } from "react-toastify";
import { siteSettingsContext } from "../../contexts";
import { extractErrors, validateForm } from "../../validation";
import { checkoutFormSchema } from "../../validation/checkout.validation";
import ErrorMessage from "../../components/utils/error";
import TransparentSpinner from "../../components/utils/transparentSpinner";
import tabblyIcon from "../../assets/paymentMethodIcons/tabby-logo.svg";
import tamaraIcon from "../../assets/paymentMethodIcons/tamaraLogo.png";

import Popup from "../payment/tabbyPopUp";
import PopupTamara from "../payment/tamaraPopup";
import dayjs from "dayjs";
import axios from "axios";

let utc = require("dayjs/plugin/utc");
let timeZone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timeZone);
const TIME_ZONE = "Asia/Dubai";
const currentDay = dayjs().tz(TIME_ZONE);
const nextDay = currentDay.add(1, "day");
const formattedNextDay = nextDay.format("YYYY-MM-DD");

const breadcrumbLinks = [
  {
    id: 0,
    path: "/",
    text: t("home"),
  },
  {
    id: 1,
    path: "/checkout",
    text: t("checkout"),
    isActive: true,
  },
];

let initialErrors = {
  name: "",
  phone_number: "",
  email: "",
  country: "",
  state: "",
  city: "",
  address: "",
  notes: "",
  paymentMethod: "",
};

const Checkout = () => {
  const siteInfo = useContext(siteSettingsContext);
  let [state, setState] = useState({
    cities: [],
    citiesArray: [],
    states: [],
    countries: [],
    products: [],
    shippingCost: 0,
    discount: 0,
    discountType: "",
    promocode: "",
    isPickupFromStore: 0,
    isValidPromocode: "",
    totalDiscount: 0,
    totalTax: 0,
    subTotal: 0,
    totalWithShipping: 0,
    paymentMethods: [],
    userDetails: {},
    cartId: "",
    stateId: "",
    countryId: "",
    cityId: "",
    response: {},
    selectedPaymentType: null,
    userInfo: {},
  });

  const [errors, setErrors] = useState(initialErrors);
  const [isTabbyPopupVisible, setIsTabbyPopupVisible] = useState(false);
  const [isTamaraPopupVisible, setIsTamaraPopupVisible] = useState(false);
  const [installmentOption, setInstallmentOption] = useState("");

  const navigate = useNavigate();
  let [getCheckoutDetails, { isLoading }] = useGetCheckoutDetailsMutation();
  let [validatePromocode, { isLoading: validatingPromocode }] =
    useValidatePromocodeMutation();
  let [validateCheckoutDetails, { isLoading: validatingCheckoutDetails }] =
    useValidateCheckoutDetailsMutation();
  let [initiateTabbyPayment] = useInitiateTabbyPaymentMutation();
  let [createTamaraSession] = useCreateTamaraSessonMutation();
  let [fetchSubProductDimensions] = useFetchSubProductDimensionsMutation();
  let [getDHLShippingCost] = useGetDHLShippingCostMutation();
  const [loadingShippingCost, setLoadingShippingCost] = useState(false);
  useLayoutEffect(() => {
    let searchBar = document.getElementById("cyr-search-bar");
    if (searchBar) {
      searchBar.style.display = "none";
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      let response = await getCheckoutDetails();
      if (response.data) {
        if (Number(response.data?.status) === 1) {
          let checkoutDetails = response.data.data;

          let calculations = calculateProductTotalPrice(
            checkoutDetails.products,
            Number(checkoutDetails.shippingCost),
            state.discountType,
            state.isValidPromocode,
            state.discount,
            checkoutDetails.tax
          );

          let countries = [];

          for (let i = 0; i < checkoutDetails?.stateAndCities?.length; i++) {
            const country = checkoutDetails?.stateAndCities[i];
            countries.push({
              country_name: country["country_name"],
              country_id: country["country_id"],
              country_iso_code: country["ISO_country_code"] ?? country["country_code"],
            });
          }

          // const countries = [
          //   { country_name: "United Arab Emrites", country_id: "254" },
          //   { country_name: "United States", country_id: "255" },
          //   { country_name: "Canada", country_id: "256" },
          //   { country_name: "Mexico", country_id: "257" },
          // ];

          let states = [];
          let cities = [];
          let citiesArray = [];
          let cityId = "";
          let stateId = "";
          let countryId = "";

          if (checkoutDetails?.userDetails?.country_id) {
            countryId = checkoutDetails?.userDetails?.country_id;
            let response = checkoutDetails?.stateAndCities;
            for (let i = 0; i < response.length; i++) {
              if (
                Number(response[i]["country_id"]) ===
                Number(checkoutDetails?.userDetails?.country_id)
              ) {
                states = response[i]["states"];
                citiesArray = response[i]["cities"];
                break;
              }
            }
          }
          if (checkoutDetails?.userDetails?.state_id) {
            stateId = checkoutDetails?.userDetails?.state_id;
            if (citiesArray && citiesArray?.length > 0) {
              for (let i = 0; i < citiesArray.length; i++) {
                if (
                  Number(citiesArray[i]["stateid"]) ===
                  Number(checkoutDetails?.userDetails?.state_id)
                ) {
                  cities.push(citiesArray[i]);
                }
              }
            }
          }

          if (checkoutDetails?.userDetails?.city_id) {
            cityId = checkoutDetails?.userDetails?.city_id;
          }

          let updatedState = {
            ...state,
            products: calculations?.products,
            cities: cities,
            states,
            citiesArray,
            // cities: checkoutDetails.stateAndCities[0]["cities"],
            // states: checkoutDetails.stateAndCities[0]["states"],
            countries: countries,
            shippingCost: checkoutDetails.shippingCost,
            subTotal:
              calculations?.totalWithoutShipping + calculations?.totalDiscount,
            totalWithShipping: calculations?.totalWithShipping,
            totalTax: calculations?.totalTax,
            paymentMethods: checkoutDetails?.paymentMethods,
            userDetails: checkoutDetails?.userDetails,
            cartId: checkoutDetails?.cartId,
            response: checkoutDetails,
            stateId,
            cityId,
            countryId,
            userInfo: getUserInfo(),
          };
          setState(updatedState);
        } else {
          handleResponse(response?.data, toast, navigate);
          navigate("/", { replace: true });
        }
      } else {
        let message = t("something_went_wrong");
        toast.error(message, toastConfig);
        navigate("/");
      }
    };
    fetchData();
  }, []);

  const handleCalculation = (
    products = [],
    shippingCost = 0,
    discountType = "",
    isValidPromocode = false,
    discount = 0
  ) => {
    let calculations = calculateProductTotalPrice(
      products,
      Number(shippingCost),
      discountType,
      isValidPromocode,
      discount,
      state?.response?.tax
    );
    let updatedState = {
      ...state,
      products: calculations?.products,
      shippingCost: shippingCost,
      subTotal:
        calculations?.totalWithoutShipping + calculations?.totalDiscount,
      totalWithShipping: calculations?.totalWithShipping,
      discountType: discountType,
      totalDiscount: calculations?.totalDiscount,
      totalTax: calculations?.totalTax,
      isValidPromocode: isValidPromocode,
      discount: discount,
    };
    setState(updatedState);
  };

  const handleCategoryChange = (countryId) => {
    let states = [];
    let cities = [];
    if (
      state?.response?.stateAndCities &&
      state?.response?.stateAndCities?.length > 0 &&
      countryId !== "" &&
      !isNaN(countryId)
    ) {
      let statesAndCities = state?.response?.stateAndCities;
      for (let i = 0; i < statesAndCities.length; i++) {
        if (Number(statesAndCities[i]["country_id"]) === Number(countryId)) {
          states = statesAndCities[i]["states"];
          cities = statesAndCities[i]["cities"];
          break;
        }
      }
      setState((prev) => ({
        ...prev,
        countryId: Number(countryId),
        // states: states,
        // citiesArray: cities,
        stateId: null,
        cityId: null,
        states: states,
        citiesArray: cities,
        cities: [],
      }));
    }
  };

  const handleStateChange = (stateId) => {
    let cities = [];
    if (state?.citiesArray && state?.citiesArray?.length > 0) {
      let citiesArray = state?.citiesArray;
      for (let i = 0; i < citiesArray.length; i++) {
        if (Number(citiesArray[i]["stateid"]) === Number(stateId)) {
          cities.push(citiesArray[i]);
        }
      }
    }
    setState((prev) => ({
      ...prev,
      stateId: Number(stateId),
      cities: cities,
    }));
  };

  const handleCityChanges = (cityId) => {
    if (!cityId) {
      return;
    }
    let shippingCost = 0;
    let statesAndCities = state?.response?.stateAndCities;
    for (let i = 0; i < statesAndCities?.length; i++) {
      let country = statesAndCities[i];
      if (country["country_id"] === state?.countryId) {
        let cities = country["cities"];
        for (let j = 0; j < cities.length; j++) {
          const city = cities[j];
          if (city["city_id"] === Number(cityId)) {
            shippingCost = Number(city["delivery_charge"]);
            break;
          }
        }
        break;
      }
    }
    if (state?.countryId && state?.countryId == 254) {
      handleCalculation(
        state?.response?.products,
        shippingCost,
        state?.discountType,
        state?.isValidPromocode,
        state?.discount,
        state?.countries,
        state?.countryId
      );
    }
    setState((prev) => ({
      ...prev,
      cityId: cityId,
    }));
  };

  const getProductDimension = async (e) => {
    const DHLCustomerAccountNumber = "454067819";
    const cityName = "Sharjah";
    const ISOCountryCode = "AE";
    try {
      let response = await getCheckoutDetails();
      let checkoutDetails = response.data.data;

      const products = checkoutDetails?.products;
      const quantitiesAndIds = products.map((product) => ({
        item_quantity: product.item_quantity,
        sub_product_id: product.sub_product_id,
      }));
      const subProductIds = products.map((product) => product.sub_product_id);

      const dimensionResponse = await fetchSubProductDimensions(subProductIds);
      const dimensionData = dimensionResponse.data;

      let totalWeight = 0;
      let totalHeight = 0;
      let totalLength = 0;
      let totalWidth = 0;

      const dimensionMap = dimensionData.reduce((map, dimension) => {
        map[dimension.id] = dimension;
        return map;
      }, {});

      for (const { item_quantity, sub_product_id } of quantitiesAndIds) {
        const dimensions = dimensionMap[sub_product_id];

        const weightInKg = dimensions.weight / 1000;

        totalWeight += weightInKg * item_quantity;
        totalHeight += dimensions.height * item_quantity;
        if (dimensions.plength > totalLength) totalLength = dimensions.plength;
        if (dimensions.width > totalWidth) totalWidth = dimensions.width;

        // totalLength += dimensions.length * item_quantity;
        // if (dimensions.width > totalWidth) totalWidth = dimensions.width;
        // if (dimensions.height > totalHeight) totalHeight = dimensions.height;
      }

      const destinationCityName = document.getElementById("state").value;
      const destinationCountryName = document.getElementById("country").value;

      const desCityName = state?.states.find(
        (states) => states.state_id == destinationCityName
      )?.state_name;
      const desCountryName = state?.countries.find(
        (country) => country.country_id == destinationCountryName
      )?.country_iso_code;
      let requestData = {
        accountNumber: DHLCustomerAccountNumber,
        originCountryCode: ISOCountryCode,
        originCityName: cityName,
        destinationCountryCode: desCountryName,
        destinationCityName: desCityName,
        weight: totalWeight,
        length: totalLength,
        width: totalWidth,
        height: totalHeight,
        plannedShippingDate: formattedNextDay,
        isCustomsDeclarable: true,
        unitOfMeasurement: "metric",
      };

      setLoadingShippingCost(true);

      const dhlRatingResponse = await getDHLShippingCost(requestData);

      if (
        dhlRatingResponse.data &&
        dhlRatingResponse.data.priceInAED != null &&
        dhlRatingResponse.data.priceInAED !== "" &&
        typeof dhlRatingResponse.data.priceInAED !== "undefined"
      ) {
        let totalDHLShipping = dhlRatingResponse.data.priceInAED;

        handleCalculation(
          state?.response?.products,
          totalDHLShipping,
          state?.discountType,
          state?.isValidPromocode,
          state?.discount
        );
      } else if (dhlRatingResponse.error?.data?.message?.status === 400) {
        let message =
          "Shipping is not available in this selected destination, please select a different city/country.";
        toast.error(message, toastConfig);
        let totalDHLShipping = 0;
        handleCalculation(
          state?.response?.products,
          totalDHLShipping,
          state?.discountType,
          state?.isValidPromocode,
          state?.discount
        );
      } else {
        let message =
          "Unable to retrieve DHL shipping information right now. Please check back soon.";
        toast.error(message, toastConfig);
        let totalDHLShipping = 0;
        handleCalculation(
          state?.response?.products,
          totalDHLShipping,
          state?.discountType,
          state?.isValidPromocode,
          state?.discount
        );
      }
    } catch (error) {
      console.error("Error calculating product dimensions:", error);
    } finally {
      setLoadingShippingCost(false);
    }
  };

  useEffect(() => {
    if (state?.cityId) {
      if (state.countryId !== 254) {
        getProductDimension();
      } else {
        handleCalculation(
          state?.response?.products,
          state?.shippingCost,
          state?.discountType,
          state?.isValidPromocode,
          state?.discount,
          state?.countries,
          state?.countryId
        );
      }
    }
  }, [state.cityId]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());

    // if (Number(state?.selectedPaymentType) === 2) {
    //   data["paymentMethod"] = -2;
    // } else if (Number(state?.selectedPaymentType) === 0) {
    //   data["paymentMethod"] = -1;
    // }
    if (Number(state?.selectedPaymentType) === 0) {
      data["paymentMethod"] = -1;
    }
    if (Number(state?.selectedPaymentType) === 1) {
      data["paymentMethod"] = 6;
    }
    if (Number(state?.selectedPaymentType) === 2) {
      data["paymentMethod"] = 7;
    }
    if (Number(state?.selectedPaymentType) === 3) {
      data["paymentMethod"] = 8;
    }
    data["isPickupFromStore"] = !isNaN(Number(state?.isPickupFromStore))
      ? Number(state?.isPickupFromStore)
      : 0;

    if (!state?.userInfo?.user_id) {
      // data["email"] = `GU${data["phone_number"]}@mail.com`;
      data["email"] = data.email;
    }

    if (state?.isPickupFromStore) {
      if (state?.userInfo?.user_id) {
        data["email"] = state?.response?.userDetails?.email;
      }

      data["address"] = "----------";
      data["state"] = "0";
      data["city"] = "0";
      data["country"] = "0";
    }
    let validation = validateForm(checkoutFormSchema, data);
    if (!validation.isValidForm) {
      let errorObject = extractErrors(validation.errors ?? []);
      setErrors(errorObject);
      console.log("errorObject : ", errorObject);
    } else {
      let myCheckoutProducts = [];
      state?.products.forEach((product) => {
        myCheckoutProducts.push({
          deal_id: product?.deal_id,
          cart_id: state?.userInfo?.user_id ? product?.cart_id : 0,
          item_id: product?.item_id,
          sub_product_id: product?.sub_product_id,
          item_quantity: Number(product?.item_quantity),
          currentPrice: Number(product?.currentPrice),
        });
      });

      let requestData = {
        ...data,
        cartId: state?.userInfo?.user_id ? state.cartId : 0,
        paymentMethod: Number(data?.paymentMethod),
        city: Number(data?.city),
        state: Number(data?.state),
        country: Number(data?.country),
        discount: state.isValidPromocode ? state?.discount : 0,
        discountType: state.isValidPromocode ? state?.discountType : "",
        promocode: state.isValidPromocode ? state?.promocode : "",
        finalTotal: Number(state?.totalWithShipping),
        totalDiscount: state.isValidPromocode
          ? Number(state?.totalDiscount)
          : 0,
        totalTax: Number(state?.totalTax) ?? 0,
        tax: Number(state?.response?.tax),
        totalAmount: Number(state?.subTotal),
        shippingCost: Number(state.shippingCost),
        productDetails: myCheckoutProducts,
      };
      if (Number(state?.selectedPaymentType) === 2) {
        let itemsDetails = [];

        state?.products.forEach((product) => {
          itemsDetails.push({
            title: product?.deal_title,
            quantity: Number(product?.item_quantity),
            unit_price: String(product?.currentPrice),
            category: String(product?.sub_product_id),
          });
        });

        let requestData = {
          ...data,
          cart_id: state?.userInfo?.user_id ? state.cartId : 0,
          paymentMethod: Number(data?.paymentMethod),
          city: Number(data?.city),
          state: Number(data?.state),
          country: Number(data?.country),
          address: data?.address,
          notes: data?.notes,
          discount: state.isValidPromocode ? state?.discount : 0,
          discountType: Number(
            state.isValidPromocode ? state?.discountType : ""
          ),
          promocode: state.isValidPromocode ? state?.promocode : "",
          grandTotal: Number(state?.totalWithShipping),
          totalDiscount: state.isValidPromocode
            ? Number(state?.totalDiscount)
            : 0,
          totalTax: Number(state?.totalTax) ?? 0,
          tax: Number(state?.response?.tax),
          subTotal: Number(state?.subTotal),
          totalShippingCost: Number(state.shippingCost),
          productIds: myCheckoutProducts,
        };

        let paymentData = {
          payment: {
            amount: String(state?.totalWithShipping),
            currency: "AED",
            buyer: {
              phone: data.phone_number,
              email: data.email,
              name: data.name,
            },
            shipping_address: {
              city: data.city,
              address: data.address,
              zip: "00000",
            },
            order: {
              tax_amount: "5.00",
              shipping_amount: "1.00",
              discount_amount: "2.00",
              reference_id: state?.cartId.toString(),
              items: itemsDetails,
            },
            buyer_history: {
              registered_since: "2019-08-24T14:15:22Z",
              loyalty_level: 0,
            },
            order_history: [
              {
                purchased_at: new Date().toISOString(),
                amount: String(state?.totalWithShipping),
                status: "new",
                buyer: {
                  phone: data.phone_number,
                  email: data.email,
                  name: data.name,
                },
                shipping_address: {
                  city: data.city,
                  address: data.address,
                  zip: data.state,
                },
              },
            ],
            meta: { requestData },
          },
          lang: "en",
          merchant_code: "MANAHEL ALTHUNAYYAN CO.LLC SPare",
          // merchant_urls: {
          //   success: "http://localhost:3000/tabby-success",
          //   cancel: "http://localhost:3000/tabby-failed",
          //   failure: "http://localhost:3000/tabby-cancel",
          // },
          // merchant_urls: {
          //   success: "https://ecom.indiprotechnologies.com/tabby-success",
          //   cancel: "https://ecom.indiprotechnologies.com/tabby-failed",
          //   failure: "https://ecom.indiprotechnologies.com/tabby-cancel",
          // },
          merchant_urls: {
            success: "https://www.thunyanhoneyuae.com/tabby-success",
            cancel: "https://www.thunyanhoneyuae.com/tabby-failed",
            failure: "https://www.thunyanhoneyuae.com/tabby-cancel",
          },
          token: null,
        };
        console.log("paymentData of TABBY : ", paymentData);
        const tabbyResponse = await initiateTabbyPayment(paymentData);
        console.log("tabbyResponse of TABBY : ", tabbyResponse);
        let webUrl = tabbyResponse.data.webURL;
        if (tabbyResponse.data.success == true && webUrl) {
          window.location.href = webUrl;
          return;
        } else if (webUrl == "") {
          toast.error(t("tabby_rejected_message"));
          navigate("/checkout");
          return;
        }
      }

      if (Number(state?.selectedPaymentType) === 3) {
        let itemsDetails = [];
        state?.products.forEach((product) => {
          itemsDetails.push({
            name: product?.deal_title,
            quantity: Number(product?.item_quantity),
            reference_id: state?.cartId.toString(),
            type: "Digital",
            sku: String(product?.sub_product_id),
            total_amount: {
              amount: state?.subTotal,
              currency: "SAR",
            },
          });
        });

        let requestData = {
          ...data,
          cart_id: state?.userInfo?.user_id ? state.cartId : 0,
          paymentMethod: Number(data?.paymentMethod),
          city: Number(data?.city),
          state: Number(data?.state),
          country: Number(data?.country),
          address: data?.address,
          notes: data?.notes,
          discount: state.isValidPromocode ? state?.discount : 0,
          discountType: Number(
            state.isValidPromocode ? state?.discountType : ""
          ),
          promocode: state.isValidPromocode ? state?.promocode : "",
          grandTotal: Number(state?.totalWithShipping),
          totalDiscount: state.isValidPromocode
            ? Number(state?.totalDiscount)
            : 0,
          totalTax: Number(state?.totalTax) ?? 0,
          tax: Number(state?.response?.tax),
          subTotal: Number(state?.subTotal),
          totalShippingCost: Number(state.shippingCost),
          productIds: myCheckoutProducts,
        };

        const fullName = data.name.trim();
        const nameParts = fullName.split(" ");
        const firstName = nameParts.shift();
        const lastName = nameParts.pop();

        let requestDataTamara = {
          total_amount: {
            amount: state?.totalWithShipping,
            currency: "AED",
          },
          shipping_amount: {
            amount: Number(state.shippingCost),
            currency: "AED",
          },
          tax_amount: {
            amount: Number(state?.totalTax),
            currency: "AED",
          },
          order_reference_id: state?.cartId.toString(),
          items: itemsDetails,
          total_amount: {
            amount: state?.totalWithShipping,
            currency: "AED",
          },
          consumer: {
            email: data.email,
            first_name: firstName,
            last_name: lastName,
            phone_number: data.phone_number,
          },
          country_code: "AE",
          description: "The order description ",
          // STAGING
          // merchant_url: {
          //   cancel: "https://ecom.indiprotechnologies.com/tamara-cancel",
          //   failure: "https://ecom.indiprotechnologies.com/tamara-fail",
          //   success: "https://ecom.indiprotechnologies.com/tamara-success",
          //   notification:
          //     "https://ecomapi.indiprotechnologies.com/api/checkoutTest/tamara-webhook",
          // },

          //   LIVE
          //   merchant_url: {
          //     cancel: "https://www.thunyanhoneyuae.com/tamara-cancel",
          //     failure: "https://www.thunyanhoneyuae.com/tamara-fail",
          //     success: "https://www.thunyanhoneyuae.com/tamara-success",
          //     notification:
          //       "https://api.thunyanhoneyuae.com/api/checkoutTest/tamara-webhook",
          //   },

          //   LOCAL
          // merchant_url: {
          //   cancel: "http://localhost:3000/tamara-cancel",
          //   failure: "http://localhost:3000/tamara-fail",
          //   success: "http://localhost:3000/tamara-success",
          //   notification:
          //     "https://2d86-2401-4900-8827-4b4b-796c-89d4-3614-cdd0.ngrok-free.app/api/checkoutTest/tamara-webhook",
          // },
          payment_type: installmentOption,
          instalments: 3,
          shipping_address: {
            city: String(data?.city),
            country_code: "AE",
            first_name: firstName,
            last_name: lastName,
            line1: data?.address,
            line2: data?.state,
          },
          additional_data: requestData,
        };

        console.log("requestDataTamara TAMARA : ", requestDataTamara);

        const tamaraResponse = await createTamaraSession(requestDataTamara);
        console.log("tamaraResponse TAMARA : ", tamaraResponse);

        let webUrl = tamaraResponse.data.webURL;
        if (tamaraResponse.data.success == true && webUrl) {
          window.location.href = webUrl;
          return;
        } else if (!webUrl) {
          toast.error(t("tamara_rejected_message"));
          navigate("/checkout");
          return;
        }
      }

      const response = await validateCheckoutDetails(requestData);
      setErrors(initialErrors);

      if (response.data) {
        if (Number(response.data?.status) === -3) {
          let errorObject = extractErrors(response?.data?.errors ?? []);
          setErrors(errorObject);
        } else if (Number(response.data?.status) === 2) {
          let message = response?.data?.message;
          toast.success(message, toastConfig);
          siteInfo?.refetch();
          navigate("/");
        } else if (Number(response.data?.status) === 1) {
          let payementDetails = response.data.data;
          if (payementDetails?.paymentURL) {
            let orderButton = document.getElementById("order_button");
            let applyButton = document.getElementById("apply_button");

            if (orderButton) {
              orderButton.disabled = true;
            }
            if (applyButton) {
              applyButton.disabled = true;
            }

            window.location.href = payementDetails?.paymentURL;
          }
        } else {
          handleResponse(response?.data, toast, navigate);
        }
      } else {
        let message = t("something_went_wrong");
        toast.error(message, toastConfig);
      }
    }
  };

  const handleInputChange = (value, key) => {
    setState((prev) => ({
      ...prev,
      userDetails: {
        ...prev.userDetails,
        [key]: value,
      },
    }));
  };

  const handlePromocodeChange = (e) => {
    if (e.target.value?.length <= 10) {
      setState((prev) => ({
        ...prev,
        promocode: e.target.value?.toUpperCase(),
        discount: 0,
        discountType: "",
        totalDiscount: 0,
        totalWithShipping: Number(
          Number(prev.totalWithShipping) + Number(prev.totalDiscount)
        ),
      }));
    }
  };

  const handleApplyPromocode = async () => {
    if (state?.promocode && state?.promocode?.length > 0) {
      let response = await validatePromocode({ promocode: state?.promocode });
      if (response.data) {
        if (Number(response.data?.status) === 1) {
          let discountDetails = response.data.data;
          if (
            discountDetails?.minpromotype &&
            state?.subTotal < discountDetails["minimum_total"]
          ) {
            let message = t("promocode_total_error").replace(
              "##PRODUCT_VALUE##",
              `${siteInfo?.siteSettings?.currency_symbol} ${Math.floor(
                Number(discountDetails["minimum_total"]) -
                  Number(state?.subTotal)
              )}`
            );
            toast.success(message, toastConfig);
            return;
          }

          let message = t("promocode_applied_successfully");
          toast.success(message, toastConfig);
          handleCalculation(
            state?.products,
            state?.shippingCost,
            discountDetails?.type,
            true,
            discountDetails?.discount
          );
        } else {
          // handleResponse(response?.data, toast, navigate);
        }
      } else {
        let message = t("something_went_wrong");
        toast.error(message, toastConfig);
        navigate("/");
      }
    }
  };

  const handlePaymentMethodChange = (e) => {
    setState((prev) => ({
      ...prev,

      selectedPaymentType: Number(e.target.value),
    }));
  };

  const handleDeliveryType = (e) => {
    handleCalculation(
      state?.response?.products,
      0,
      state?.discountType,
      state?.isValidPromocode,
      state?.discount
    );
    setState((prev) => ({
      ...prev,
      isPickupFromStore: Number(e?.target?.value),
      stateId: "",
      countryId: "",
      cityId: "",
      shippingCost: 0,
    }));
  };

  console.log("state.isPickupFromStore", state.isPickupFromStore);
  console.log("state.shippingCost", state.shippingCost);
  console.log("state.totalWithShipping", state.totalWithShipping);

  const handleTabbyIconClick = () => {
    setIsTabbyPopupVisible(true);
  };
  const handleClosePopup = () => {
    setIsTabbyPopupVisible(false);
  };
  const handleTamaraIconClick = () => {
    setIsTamaraPopupVisible(true);
  };
  const handleTamaraClosePopup = () => {
    setIsTamaraPopupVisible(false);
  };
  const handleInstallmentOptionChange = (e) => {
    setInstallmentOption(e.target.value);
  };

  const ShippingCostLoader = () => (
    <div className="shipping-loader">
      <div className="loader-icon">
        <div className="circle"></div>
      </div>
      <span>Calculating...</span>
    </div>
  );
  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      {(validatingPromocode || validatingCheckoutDetails) && !isLoading && (
        <TransparentSpinner />
      )}
      <div className="page-options-ctnr">
        <div className="container">
          <div className="row">
            <div className="page-options-ctnr-inner">
              <BreadCrumb links={breadcrumbLinks} />
            </div>
          </div>
        </div>
      </div>
      <div className="payment-page-ctnr">
        <div className="container">
          <form onSubmit={handleFormSubmit}>
            <div className="payment-page-ctnr-inner">
              <div className="row">
                <div className="col-12 col-sm-12 col-md-12 col-lg-9 mb-4 mb-lg-0">
                  <div className="payment-lft">
                    <h2 className="page-title">{t("payment_information")}</h2>
                    <div className="payment-form-blk">
                      <div className="form-grp">
                        <label htmlFor="name" className="form-label">
                          {t("full_name")}
                          <sup>*</sup>
                        </label>
                        <input
                          type="text"
                          name="name"
                          onChange={(e) =>
                            handleInputChange(e.target.value, "firstname")
                          }
                          value={`${state?.userDetails?.firstname ?? ""}`}
                          className="form-control"
                          id="name"
                          placeholder={t("full_name_placeholder")}
                        />
                        <ErrorMessage
                          message={errors?.name}
                          show={errors?.name && errors?.name !== ""}
                        />
                      </div>
                      <div
                        className={
                          state?.userInfo?.user_id && !state?.isPickupFromStore
                            ? "form-70-30"
                            : ""
                        }
                      >
                        <div className="form-grp">
                          <label htmlFor="phone_number" className="form-label">
                            {t("phone_number")}
                            <sup>*</sup>
                          </label>
                          <input
                            type="tel"
                            name="phone_number"
                            onChange={(e) =>
                              handleInputChange(e.target.value, "phone_number")
                            }
                            value={`${state?.userDetails?.phone_number ?? ""}`}
                            className="form-control"
                            placeholder={t("phone_number_placeholder")}
                            id="phone_number"
                          />
                          <ErrorMessage
                            message={errors?.phone_number}
                            show={
                              errors?.phone_number &&
                              errors?.phone_number !== ""
                            }
                          />
                        </div>
                        {!state?.isPickupFromStore && (
                          <div className="form-grp">
                            <label htmlFor="email" className="form-label">
                              {t("email")}
                              <sup>*</sup>
                            </label>
                            <input
                              type="email"
                              name="email"
                              onChange={(e) =>
                                handleInputChange(e.target.value, "email")
                              }
                              value={`${state?.userDetails?.email ?? ""}`}
                              className="form-control"
                              id="email"
                              placeholder={t("email_placeholder")}
                            />
                            <ErrorMessage
                              message={errors?.email}
                              show={errors?.email && errors?.email !== ""}
                            />
                          </div>
                        )}
                      </div>

                      {!state?.isPickupFromStore && (
                        <>
                          <div className="form-grp">
                            <label htmlFor="country" className="form-label">
                              {t("country")}
                              <sup>*</sup>
                            </label>
                            <select
                              name="country"
                              id="country"
                              value={state?.countryId}
                              onChange={(e) =>
                                handleCategoryChange(e.target.value)
                              }
                              placeholder={t("country_placeholder")}
                              className="form-select form-control"
                            >
                              <option>{t("country_placeholder")}</option>
                              {state?.countries?.map((country) => {
                                return (
                                  <option
                                    key={country?.country_id}
                                    value={country?.country_id}
                                  >
                                    {country?.country_name}
                                  </option>
                                );
                              })}
                            </select>
                            <ErrorMessage
                              message={errors?.country}
                              show={errors?.country && errors?.country !== ""}
                            />
                          </div>
                          <div className="form-70-30">
                            <div className="form-grp">
                              <label htmlFor="state" className="form-label">
                                {t("city")}
                                <sup>*</sup>
                              </label>
                              <select
                                placeholder={t("city_placeholder")}
                                className="form-select form-control"
                                name="state"
                                id="state"
                                value={state?.stateId}
                                onChange={(e) =>
                                  handleStateChange(e.target.value)
                                }
                                disabled={!state?.countryId}
                              >
                                <option>{t("city_placeholder")}</option>
                                {state?.countryId &&
                                  state?.states?.map((states) => {
                                    return (
                                      <option
                                        key={states?.state_id}
                                        value={states?.state_id}
                                      >
                                        {getWordBasedOnLanguage(
                                          states?.state_name,
                                          states?.state_name_arabic
                                        )}
                                      </option>
                                    );
                                  })}
                              </select>
                              <ErrorMessage
                                message={errors?.state}
                                show={errors?.state && errors?.state !== ""}
                              />
                            </div>
                            <div className="form-grp">
                              <label htmlFor="city" className="form-label">
                                {t("area")}
                                <sup>*</sup>
                              </label>
                              <select
                                placeholder={t("area_placeholder")}
                                className="form-select form-control"
                                name="city"
                                id="city"
                                value={state?.cityId}
                                onChange={(e) =>
                                  handleCityChanges(e.target.value)
                                }
                                disabled={!state?.stateId || !state?.countryId}
                              >
                                <option>{t("area_placeholder")}</option>
                                {state?.stateId &&
                                  state?.countryId &&
                                  state?.cities?.map((city) => {
                                    return (
                                      <option
                                        key={city?.city_id}
                                        value={city?.city_id}
                                      >
                                        {getWordBasedOnLanguage(
                                          city?.city_name,
                                          city?.city_name_french
                                        )}
                                      </option>
                                    );
                                  })}
                              </select>
                              <ErrorMessage
                                message={errors?.city}
                                show={errors?.city && errors?.city !== ""}
                              />
                            </div>
                          </div>
                          <div className="form-grp">
                            <label htmlFor="address" className="form-label">
                              {t("address")}
                              <sup>*</sup>
                            </label>
                            <textarea
                              className="form-control"
                              id="address"
                              rows="1"
                              onChange={(e) =>
                                handleInputChange(e.target.value, "address1")
                              }
                              value={state?.userDetails?.address1 ?? ""}
                              name="address"
                              placeholder={t("address_placeholder")}
                            ></textarea>
                            <ErrorMessage
                              message={errors?.address}
                              show={errors?.address && errors?.address !== ""}
                            />
                          </div>
                        </>
                      )}
                      {/* <div className="form-grp">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="use_anathor_address"
                        />
                        <label className="form-check-label" htmlFor="terms">
                          {t("delivery_to_anathor_address")}
                        </label>
                      </div>
                    </div> */}
                      <div className="form-grp">
                        <label htmlFor="notes" className="form-label">
                          {t("note")}
                        </label>
                        <textarea
                          className="form-control"
                          id="notes"
                          rows="3"
                          name="notes"
                          placeholder={t("notes_placeholder")}
                        ></textarea>
                        <ErrorMessage
                          message={errors?.notes}
                          show={errors?.notes && errors?.notes !== ""}
                        />
                        <p className="text-muted">
                          {t("privacy_policy_text")}{" "}
                          <Link to="/privacy_policy">
                            {t("privacy_policy")}
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-12 col-md-12 col-lg-3">
                  <div className="payment-rgt">
                    <h3 className="page-title">{t("your_order")}</h3>
                    <ul>
                      {state?.products?.map((product) => {
                        return (
                          <li key={product?.sub_product_id}>
                            <div className="prod-det-sm">
                              <img
                                src={product.image}
                                // alt={product?.deal_title}
                                alt={getWordBasedOnLanguage(
                                  product.deal_title,
                                  product?.deal_title_french
                                )}
                              />
                              <div className="prod-det-sm-cont">
                                <h6 className="prod-name">
                                  <Link
                                    to={`/product_detail?q=${product?.deal_key}`}
                                    title="Clover Honey"
                                  >
                                    {/* {product?.deal_title} */}
                                    {getWordBasedOnLanguage(
                                      product.deal_title,
                                      product?.deal_title_french
                                    )}
                                  </Link>
                                  <span>
                                    {t("qty")}:{product?.item_quantity}
                                  </span>
                                </h6>
                                <span className="prod-price">
                                  {`${
                                    siteInfo?.siteSettings?.currency_symbol
                                  } ${currencyFormatter(product?.totalPrice)}`}
                                </span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="sub-total">
                      <span>{t("sub_total")}</span>
                      <span className="tot-value">
                        {`${
                          siteInfo?.siteSettings?.currency_symbol
                        } ${currencyFormatter(state?.subTotal)}`}
                      </span>
                    </p>
                    <p className="sub-total">
                      <span>{t("tax")}</span>
                      <span className="tot-value">
                        {`${
                          siteInfo?.siteSettings?.currency_symbol
                        } ${currencyFormatter(state?.totalTax)}`}
                      </span>
                    </p>
                    <div className="payment-accord-ctnr">
                      <div
                        className="accordion"
                        id="accordionPanelsStayOpenExample"
                      >
                        <div className="accordion-item">
                          <h2
                            className="accordion-header"
                            id="panelsStayOpen-headingTwo"
                          >
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#panelsStayOpen-collapseTwo"
                              aria-expanded="false"
                              aria-controls="panelsStayOpen-collapseTwo"
                            >
                              {t("apply_promocode")}
                            </button>
                          </h2>
                          <div
                            id="panelsStayOpen-collapseTwo"
                            className="accordion-collapse collapse"
                            aria-labelledby="panelsStayOpen-headingTwo"
                          >
                            <div className="accordion-body">
                              <input
                                className="form-control form-control-lg"
                                type="text"
                                value={state.promocode}
                                onChange={handlePromocodeChange}
                                placeholder={t("enter_promocode")}
                                aria-label={t("enter_promocode")}
                              />
                              <button
                                type="button"
                                onClick={handleApplyPromocode}
                                className="btn theme_btn"
                                id="apply_button"
                                disabled={
                                  isLoading ||
                                  validatingPromocode ||
                                  state?.promocode?.length <= 4
                                    ? true
                                    : false
                                }
                              >
                                {t("apply")}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="shipping-total">
                      <span>{t("shipping_fee")}:</span>
                      <span className="tot-value">
                        {loadingShippingCost ? (
                          <ShippingCostLoader />
                        ) : (
                          `${
                            siteInfo?.siteSettings?.currency_symbol
                          } ${currencyFormatter(state?.shippingCost)}`
                        )}
                      </span>
                    </p>

                    <p className="total">
                      <span>{t("total")}</span>
                      <span className="tot-value">
                        {`${
                          siteInfo?.siteSettings?.currency_symbol
                        } ${currencyFormatter(state?.totalWithShipping)}`}
                      </span>
                    </p>
                    <div className="payment-opt-blk">
                      <h6>{t("how_do_you_want_to_receive_order")}</h6>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          value={0}
                          onChange={handleDeliveryType}
                          checked={state?.isPickupFromStore ? false : true}
                        />
                        <label className="form-check-label" htmlFor="female">
                          {t("delivery")}
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          value={1}
                          onChange={handleDeliveryType}
                          checked={state?.isPickupFromStore ? true : false}
                        />
                        <label className="form-check-label" htmlFor="male">
                          {t("pickup_from_store")}
                        </label>
                      </div>
                    </div>
                    <div className="payment-opt-blk">
                      <h6>{t("payment_method")}</h6>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          value={0}
                          checked={state?.selectedPaymentType === 0}
                          onChange={handlePaymentMethodChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="female"
                          style={{ marginLeft: "5px" }}
                        >
                          {t("cash_on_delivery")}
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          value={1} // Numeric value for online_payment
                          checked={state?.selectedPaymentType === 1}
                          onChange={handlePaymentMethodChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="female"
                          style={{ marginLeft: "5px" }}
                        >
                          {t("online_payment")}
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          value={2}
                          checked={state?.selectedPaymentType === 2}
                          onChange={handlePaymentMethodChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="female"
                          style={{ marginLeft: "5px" }}
                        >
                          {t("tabby")}
                        </label>
                      </div>
                      <div className="form-check-description">
                        <div className="description-container">
                          <p className="tabby-text">
                            {t("tabby_description")}
                            <span
                              className="tabby_description"
                              onClick={handleTabbyIconClick}
                            >
                              {t("Learn_more")}
                            </span>
                          </p>
                          <div
                            className="tabbyLogo"
                            onClick={handleTabbyIconClick}
                          >
                            <img src={tabblyIcon} alt="Tabby" />
                          </div>
                        </div>
                        <Popup
                          isVisible={isTabbyPopupVisible}
                          onClose={handleClosePopup}
                        />
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          value={3}
                          checked={state?.selectedPaymentType === 3}
                          onChange={handlePaymentMethodChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="female"
                          style={{ marginLeft: "5px" }}
                        >
                          {t("tamara")}
                        </label>
                      </div>
                      {state?.selectedPaymentType === 3 && (
                        <div>
                          <select
                            style={{ marginBottom: "15px", fontSize: "13px" }}
                            value={installmentOption}
                            onChange={handleInstallmentOptionChange}
                            className="form-select"
                          >
                            <option value="">
                              {t("select_payment_option")}
                            </option>
                            <option value="PAY_NOW">
                              {t("pay_full_payment")}
                            </option>
                            <option value="PAY_BY_INSTALMENTS">
                              {t("pay_by_installments")}
                            </option>
                          </select>

                          {/* {installmentOption === "PAY_BY_INSTALMENTS" && (
                            <div>
                              <h6 style={{ marginTop: "22px" }}>
                                {t("select_number_of_installments")}
                              </h6>
                              <select
                                style={{
                                  marginTop: "-10px",
                                  marginBottom: "15px",
                                  fontSize: "12px",
                                }}
                                value={installmentSplit}
                                onChange={handleInstallmentSplitChange}
                                className="form-select"
                              >
                                <option value="2">2 {t("installments")}</option>
                                <option value="3">3 {t("installments")}</option>
                                <option value="4">4 {t("installments")}</option>
                              </select>
                            </div>
                          )} */}
                        </div>
                      )}
                    </div>
                    <div
                      className="form-check-description"
                      style={{ marginTop: "-20px" }}
                    >
                      <div className="description-container">
                        <p className="tabby-text">
                          {t("tamara_description")}
                          <span
                            className="tabby_description"
                            onClick={handleTamaraIconClick}
                          >
                            {t("Learn_more")}
                          </span>
                        </p>
                        <div
                          className="tabbyLogo"
                          onClick={handleTamaraIconClick}
                        >
                          <img src={tamaraIcon} alt="Tamara" />
                        </div>
                      </div>
                      <PopupTamara
                        isVisible={isTamaraPopupVisible}
                        onClose={handleTamaraClosePopup}
                      />
                    </div>

                    {/* <div className="payment-opt-blk">
                      <h6>{t("payment_method")}</h6>
                      <select
                        onChange={handlePaymentMethodChange}
                        className="payment_select form-select form-select-lg"
                        value={state?.selectedPaymentType}
                      >
                        {siteInfo?.siteSettings?.payment_types?.map(
                          (paymentOption) => {
                            return (
                              <option
                                key={Number(paymentOption.value)}
                                value={Number(paymentOption.value)}
                              >
                                {t(paymentOption["name"])}
                              </option>
                            );
                          }
                        )}
                        {/* <option value={1}>Online payment</option> */}
                    {/* <option value={0}>Cash on delivery</option> */}
                    {/* </select> */}
                    {/* {state?.paymentMethods &&
                    Number(state?.selectedPaymentType) === 1 &&
                    state?.paymentMethods?.length > 0 ? (
                      <>
                        {state?.paymentMethods?.map((paymentMethod) => {
                          return (
                            <div
                              key={paymentMethod?.PaymentMethodId}
                              className="form-check"
                            >
                              <input
                                className="form-check-input"
                                type="radio"
                                name="paymentMethod"
                                defaultValue={paymentMethod?.PaymentMethodId}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="flexRadioDefault1"
                              >
                                {paymentMethod?.PaymentMethodEn}
                              </label>
                            </div>
                          );
                        })}
                        <ErrorMessage
                          message={errors?.paymentMethod}
                          show={
                            errors?.paymentMethod &&
                            errors?.paymentMethod !== ""
                          }
                        />
                      </>
                    ) : null} */}
                    {/* </div>  */}
                    {/* {state?.paymentMethods &&
                      state?.paymentMethods?.length > 0 && (
                        <div className="payment-opt-blk">
                          <h6>{t("payment_method")}</h6>
                          {state?.paymentMethods?.map((paymentMethod) => {
                            return (
                              <div
                                key={paymentMethod?.PaymentMethodId}
                                className="form-check"
                              >
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="paymentMethod"
                                  defaultValue={paymentMethod?.PaymentMethodId}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="flexRadioDefault1"
                                >
                                  {paymentMethod?.PaymentMethodEn}
                                </label>
                              </div>
                            );
                          })}
                          <ErrorMessage
                            message={errors?.paymentMethod}
                            show={
                              errors?.paymentMethod &&
                              errors?.paymentMethod !== ""
                            }
                          />
                        </div>
                      )} */}
                    <button
                      type="submit"
                      disabled={validatingPromocode}
                      className="btn theme_btn"
                      id="order_button"
                      title={t("order")}
                    >
                      {t("order")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Checkout;
