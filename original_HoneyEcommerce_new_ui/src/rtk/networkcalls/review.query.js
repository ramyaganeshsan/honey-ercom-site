import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getLanguage, getToken, getUrl } from "../../utils";

export const ReviewsQuery = createApi({
  reducerPath: "reviews",
  baseQuery: fetchBaseQuery({ baseUrl: getUrl("/review") }),
  endpoints: (builder) => ({
    getReviews: builder.mutation({
      query: (deal_id) => {
        return {
          url: `/?deal_id=${deal_id}`,
          method: "GET",
          headers: {
            token: getToken(),
            lang: getLanguage(),
          },
        };
      },
      keepUnusedDataFor: 0,
    }),
    addReview: builder.mutation({
      query: (reviewDetails) => {
        return {
          url: `/`,
          method: "POST",
          body: reviewDetails,
          headers: {
            token: getToken(),
            lang: getLanguage(),
          },
        };
      },
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetReviewsMutation, useAddReviewMutation } = ReviewsQuery;
