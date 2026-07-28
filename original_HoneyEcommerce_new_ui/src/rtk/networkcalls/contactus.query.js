import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getLanguage, getToken, getUrl } from "../../utils";

export const ContactusQuery = createApi({
  reducerPath: "contactus",
  baseQuery: fetchBaseQuery({ baseUrl: getUrl("/contactus") }),
  endpoints: (builder) => ({
    addContactInfo: builder.mutation({
      query: (contactDetails) => {
        return {
          url: `/`,
          method: "POST",
          body: contactDetails,
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

export const { useAddContactInfoMutation } = ContactusQuery;
