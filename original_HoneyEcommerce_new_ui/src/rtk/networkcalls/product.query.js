import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getUrl, getToken, getLanguage } from "../../utils";

export const ProductsQuery = createApi({
  reducerPath: "product",
  baseQuery: fetchBaseQuery({ baseUrl: getUrl("/products") }),
  endpoints: (builder) => ({
    getProductFilters: builder.query({
      query: () => {
        return {
          url: `/getFilters`,
          method: "GET",
          headers: {
            token: getToken(),
            lang: getLanguage(),
          },
        };
      },
      keepUnusedDataFor: 3600,
    }),
    getProducts: builder.query({
      query: (queryString) => {
        if (queryString !== "") {
          return {
            url: `/?${queryString}`,
            method: "GET",
            headers: {
              token: getToken(),
              lang: getLanguage(),
            },
          };
        }
        return null;
      },
      keepUnusedDataFor: 0,
    }),
    getOfferProducts: builder.query({
      query: () => {
        return {
          url: `/Promotions`,
          method: "GET",
          headers: {
            token: getToken(),
            lang: getLanguage(),
          },
        };
      },
      keepUnusedDataFor: 0,
    }),
    getProductDetails: builder.query({
      query: (deal_key) => {
        if (deal_key !== "") {
          return {
            url: `/getProductDetails?deal_key=${deal_key}`,
            method: "GET",
            headers: {
              token: getToken(),
              lang: getLanguage(),
            },
          };
        }
        return null;
      },
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useGetProductFiltersQuery,
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useGetOfferProductsQuery,
} = ProductsQuery;
