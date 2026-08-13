import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getUrl, getToken, getLanguage, getSessionID } from "../../utils";

export const HomePageQuery = createApi({
  reducerPath: "home",
  baseQuery: fetchBaseQuery({ baseUrl: getUrl("/home") }),
  endpoints: (builder) => ({
    getHomePage: builder.query({
      query: () => {
        let token = "";
        try {
          token = getToken() || "";
        } catch (_) {
          token = "";
        }
        return {
          url: `/`,
          method: "GET",
          headers: {
            token,
            lang: getLanguage(),
            sessionID: token !== "" ? "" : getSessionID(),
          },
        };
      },
    }),
  }),
});

export const { useGetHomePageQuery } = HomePageQuery;
