import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getLanguage, getUrl } from "../../utils";

export const CMSQuery = createApi({
  reducerPath: "cms",
  baseQuery: fetchBaseQuery({ baseUrl: getUrl("/cms") }),
  endpoints: (builder) => ({
    getAboutusCMSDetails: builder.query({
      query: () => {
        return {
          url: `/about_us`,
          method: "GET",
          headers: {
            lang: getLanguage(),
          },
        };
      },
      keepUnusedDataFor: 1800,
    }),
    getTermsAndConditionDetails: builder.query({
      query: () => {
        return {
          url: `/terms_and_condition`,
          method: "GET",
          headers: {
            lang: getLanguage(),
          },
        };
      },
      keepUnusedDataFor: 1800,
    }),
    getPrivacyPolicyDetails: builder.query({
      query: () => {
        return {
          url: `/privacy_policy`,
          method: "GET",
          headers: {
            lang: getLanguage(),
          },
        };
      },
      keepUnusedDataFor: 1800,
    }),
    getFaqs: builder.query({
      query: () => {
        return {
          url: `/faqs`,
          method: "GET",
          headers: {
            lang: getLanguage(),
          },
        };
      },
      keepUnusedDataFor: 1800,
    }),
  }),
});

export const {
  useGetAboutusCMSDetailsQuery,
  useGetTermsAndConditionDetailsQuery,
  useGetPrivacyPolicyDetailsQuery,
  useGetFaqsQuery,
} = CMSQuery;
