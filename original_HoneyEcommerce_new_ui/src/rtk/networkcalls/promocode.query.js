import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getLanguage, getToken, getUrl } from "../../utils";

export const PromocodeQuery = createApi({
  reducerPath: "promocode",
  baseQuery: fetchBaseQuery({ baseUrl: getUrl("/promocode") }),
  endpoints: (builder) => ({
    validatePromocode: builder.mutation({
      query: (promocodeDetails) => {
        return {
          url: `/`,
          method: "POST",
          headers: {
            token: getToken(),
            lang: getLanguage(),
          },
          body: promocodeDetails,
        };
      },
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useValidatePromocodeMutation } = PromocodeQuery;
