import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getLanguage, getSessionID, getToken, getUrl } from "../../utils";

export const CheckoutQuery = createApi({
  reducerPath: "checkout",
  baseQuery: fetchBaseQuery({ baseUrl: getUrl("/checkout") }),
  endpoints: (builder) => ({
    getCheckoutDetails: builder.mutation({
      query: () => {
        return {
          url: `/`,
          method: "GET",
          headers: {
            token: getToken(),
            lang: getLanguage(),
            sessionID: getToken() !== "" ? "" : getSessionID(),
          },
        };
      },
      keepUnusedDataFor: 0,
    }),
    validateCheckoutDetails: builder.mutation({
      query: (checkoutDetails) => {
        return {
          url: `/`,
          method: "POST",
          headers: {
            token: getToken(),
            lang: getLanguage(),
            sessionID: getToken() !== "" ? "" : getSessionID(),
          },
          body: checkoutDetails,
        };
      },
      keepUnusedDataFor: 0,
    }),
    initiateTabbyPayment: builder.mutation({
      query: (combinedPayload) => {
        return {
          url: `/initiateTabbyPayment`,
          method: "POST",
          headers: {
            token: getToken(),
            lang: getLanguage(),
            sessionID: getToken() !== "" ? "" : getSessionID(),
          },
          body: combinedPayload,
        };
      },
      keepUnusedDataFor: 0,
    }),
    verifyTabbyPayment: builder.mutation({
      query: (paymentId) => {
        return {
          url: `/verifyTabbyPayment?payment_id=${paymentId}`,
          method: "GET",
          headers: {
            token: getToken(),
            lang: getLanguage(),
            sessionID: getToken() !== "" ? "" : getSessionID(),
          },
        };
      },
      keepUnusedDataFor: 0,
    }),
    capturePayment: builder.mutation({
      query: (payment) => {
        return {
          url: `/capturePaymentRequest`,
          method: "POST",
          headers: {
            token: getToken(),
            lang: getLanguage(),
            sessionID: getToken() !== "" ? "" : getSessionID(),
          },
          body: payment,
        };
      },
      keepUnusedDataFor: 0,
    }),

    registerTabbywebhook: builder.mutation({
      query: (cart_id) => {
        return {
          url: `/webhooksRegister`,
          method: "POST",
          headers: {
            token: getToken(),
            lang: getLanguage(),
            sessionID: getToken() !== "" ? "" : getSessionID(),
          },
          body: cart_id,
        };
      },
      keepUnusedDataFor: 0,
    }),
    createTamaraSesson: builder.mutation({
      query: (combinedPayload) => {
        return {
          url: `/createTamaraSesson`,
          method: "POST",
          headers: {
            token: getToken(),
            lang: getLanguage(),
            sessionID: getToken() !== "" ? "" : getSessionID(),
          },
          body: combinedPayload,
        };
      },
      keepUnusedDataFor: 0,
    }),
    authorisetamaraPayment: builder.mutation({
      query: (payment_id) => {
        return {
          url: `/authorisePayment`,
          method: "POST",
          headers: {
            token: getToken(),
            lang: getLanguage(),
            sessionID: getToken() !== "" ? "" : getSessionID(),
          },
          body: { payment_id },
        };
      },
      keepUnusedDataFor: 0,
    }),

    checkPaymentStatus: builder.mutation({
      query: (paymentDetails) => {
        return {
          url: `/`,
          method: "PUT",
          headers: {
            token: getToken(),
            lang: getLanguage(),
            sessionID: getToken() !== "" ? "" : getSessionID(),
          },
          body: paymentDetails,
        };
      },
      keepUnusedDataFor: 0,
    }),
    fetchSubProductDimensions: builder.mutation({
      query: (subProductIds) => {
        return {
          url: `/fetchDimensions`,
          method: "POST",
          headers: {
            token: getToken(),
            lang: getLanguage(),
            sessionID: getToken() !== "" ? "" : getSessionID(),
          },
          body: subProductIds,
        };
      },
      keepUnusedDataFor: 0,
    }),
    getDHLShippingCost: builder.mutation({
      query: (requestData) => {
        const queryParams = new URLSearchParams(requestData).toString();

        return {
          url: `/DHLGetratingApi?${queryParams}`,
          method: "GET",
          headers: {
            token: getToken(),
            lang: getLanguage(),
            sessionID: getToken() !== "" ? "" : getSessionID(),
          },
        };
      },
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useGetCheckoutDetailsMutation,
  useValidateCheckoutDetailsMutation,
  useCheckPaymentStatusMutation,
  useInitiateTabbyPaymentMutation,
  useVerifyTabbyPaymentMutation,
  useCapturePaymentMutation,
  useRegisterTabbywebhookMutation,
  useCreateTamaraSessonMutation,
  useAuthorisetamaraPaymentMutation,
  useFetchSubProductDimensionsMutation,
  useGetDHLShippingCostMutation,
} = CheckoutQuery;
