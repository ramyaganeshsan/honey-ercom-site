import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getLanguage, getToken, getUrl } from "../../utils";

export const CommonQuery = createApi({
  reducerPath: "common",
  baseQuery: fetchBaseQuery({ baseUrl: getUrl("/common") }),
  endpoints: (builder) => ({
    getStatesAndCities: builder.mutation({
      query: () => {
        return {
          url: `/states_and_cities`,
          method: "GET",
          headers: {
            token: getToken(),
            lang: getLanguage(),
          },
        };
      },
      keepUnusedDataFor: 1800,
    }),
  }),
});

export const { useGetStatesAndCitiesMutation } = CommonQuery;
