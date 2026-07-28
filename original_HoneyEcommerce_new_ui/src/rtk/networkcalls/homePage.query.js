import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getUrl, getToken, getLanguage, getSessionID } from "../../utils";

export const HomePageQuery = createApi({
  reducerPath: "home",
  baseQuery: fetchBaseQuery({ baseUrl: getUrl("/home") }),
  endpoints: (builder) => ({
    getHomePage: builder.query({
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
    }),
  }),
});

export const { useGetHomePageQuery } = HomePageQuery;
