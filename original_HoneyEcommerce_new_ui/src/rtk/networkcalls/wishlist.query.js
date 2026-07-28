import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getLanguage, getSessionID, getToken, getUrl } from "../../utils";

export const WishlistQuery = createApi({
  reducerPath: "wishlist",
  baseQuery: fetchBaseQuery({ baseUrl: getUrl("/wishlist") }),
  endpoints: (builder) => ({
    getMyWishlist: builder.mutation({
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
    addToWishlist: builder.mutation({
      query: (productDetails) => {
        return {
          url: `/`,
          method: "POST",
          body: productDetails,
          headers: {
            token: getToken(),
            lang: getLanguage(),
            sessionID: getToken() !== "" ? "" : getSessionID(),
          },
        };
      },
      keepUnusedDataFor: 0,
    }),
    removeFromWishlist: builder.mutation({
      query: (productDetails) => {
        return {
          url: `/`,
          method: "DELETE",
          body: productDetails,
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
  useAddToWishlistMutation,
  useGetMyWishlistMutation,
  useRemoveFromWishlistMutation,
} = WishlistQuery;
