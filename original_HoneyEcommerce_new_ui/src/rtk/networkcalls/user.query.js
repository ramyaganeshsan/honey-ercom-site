import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getLanguage, getToken, getUrl } from "../../utils";

export const UsersQuery = createApi({
  reducerPath: "user",
  baseQuery: fetchBaseQuery({ baseUrl: getUrl("/user") }),
  endpoints: (builder) => ({
    getUserProfileDetails: builder.mutation({
      query: () => {
        return {
          url: `/profile`,
          method: "GET",
          headers: {
            token: getToken(),
            lang: getLanguage(),
          },
        };
      },
      keepUnusedDataFor: 10,
    }),
    updateUserProfileDetails: builder.mutation({
      query: (userProfileDetails) => {
        return {
          url: `/profile`,
          method: "PUT",
          headers: {
            token: getToken(),
            lang: getLanguage(),
          },
          body: userProfileDetails,
        };
      },
      keepUnusedDataFor: 0,
    }),
    updatePassword: builder.mutation({
      query: (passwordDetails) => {
        return {
          url: `/change_password`,
          method: "PUT",
          headers: {
            token: getToken(),
            lang: getLanguage(),
          },
          body: passwordDetails,
        };
      },
      keepUnusedDataFor: 0,
    }),
    checkUserBlockStatus: builder.mutation({
      query: (userStatus) => {
        return {
          url: `/getUserStatus`,
          method: "POST",
          body: userStatus,
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

export const {
  useGetUserProfileDetailsMutation,
  useUpdateUserProfileDetailsMutation,
  useUpdatePasswordMutation,
  useCheckUserBlockStatusMutation,
} = UsersQuery;
