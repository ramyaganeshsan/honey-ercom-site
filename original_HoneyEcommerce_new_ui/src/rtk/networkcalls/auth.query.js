import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getLanguage, getSessionID, getUrl } from "../../utils";

export const AuthQuery = createApi({
  reducerPath: "auth",
  baseQuery: fetchBaseQuery({ baseUrl: getUrl("/auth") }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (loginDetails) => {
        return {
          url: `/login`,
          method: "POST",
          body: loginDetails,
          headers: {
            lang: getLanguage(),
            sessionID: getSessionID(),
          },
        };
      },
      keepUnusedDataFor: 0,
    }),
    signup: builder.mutation({
      query: (signupDetails) => {
        return {
          url: `/signup`,
          method: "POST",
          body: signupDetails,
          headers: {
            lang: getLanguage(),
            sessionID: getSessionID(),
          },
        };
      },
      keepUnusedDataFor: 0,
    }),
    googleSignin: builder.mutation({
      query: (goggleSigninDetails) => {
        return {
          url: `/google_signin`,
          method: "POST",
          body: goggleSigninDetails,
          headers: {
            lang: getLanguage(),
            sessionID: getSessionID(),
          },
        };
      },
      keepUnusedDataFor: 0,
    }),
    facebookSignin: builder.mutation({
      query: (facebookSigninDetails) => {
        return {
          url: `/facebook_signin`,
          method: "POST",
          body: facebookSigninDetails,
          headers: {
            lang: getLanguage(),
            sessionID: getSessionID(),
          },
        };
      },
      keepUnusedDataFor: 0,
    }),
    twitterSignIn: builder.mutation({
      query: (twitterSigninDetails) => {
        return {
          url: `/twitter_signin`,
          method: "GET",
          body: twitterSigninDetails,
          headers: {
            lang: getLanguage(),
            sessionID: getSessionID(),
          },
        };
      },
      keepUnusedDataFor: 0,
    }),
    twitterCallback: builder.mutation({
      query: (twitterCallBackDetails) => {
        return {
          url: `/twitter_callback`,
          method: "POST",
          body: twitterCallBackDetails,
          headers: {
            lang: getLanguage(),
            sessionID: getSessionID(),
          },
        };
      },
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useGoogleSigninMutation,
  useFacebookSigninMutation,
  useTwitterSignInMutation,
  useTwitterCallbackMutation,
} = AuthQuery;
