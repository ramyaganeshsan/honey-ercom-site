import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getLanguage, getSessionID, getToken, getUrl } from "../../utils";

export const CartQuery = createApi({
  reducerPath: "cart",
  baseQuery: fetchBaseQuery({ baseUrl: getUrl("/cart") }),
  endpoints: (builder) => ({
    getMyCart: builder.mutation({
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
    updateMyCart: builder.mutation({
      query: (productDetails) => {
        return {
          url: `/`,
          method: "PUT",
          headers: {
            token: getToken(),
            lang: getLanguage(),
            sessionID: getToken() !== "" ? "" : getSessionID(),
          },
          body: productDetails,
        };
      },
      keepUnusedDataFor: 0,
    }),
    addToMyCart: builder.mutation({
      query: (productDetails) => {
        return {
          url: `/`,
          method: "POST",
          headers: {
            token: getToken(),
            lang: getLanguage(),
            sessionID: getToken() !== "" ? "" : getSessionID(),
          },
          body: productDetails,
        };
      },
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useGetMyCartMutation,
  useUpdateMyCartMutation,
  useAddToMyCartMutation,
} = CartQuery;
