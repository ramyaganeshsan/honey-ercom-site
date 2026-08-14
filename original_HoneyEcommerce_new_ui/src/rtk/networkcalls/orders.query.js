import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getLanguage, getToken, getUrl } from "../../utils";

export const OrdersQuery = createApi({
  reducerPath: "orders",
  baseQuery: fetchBaseQuery({ baseUrl: getUrl("/orders") }),
  endpoints: (builder) => ({
    getMyOrders: builder.query({
      query: () => {
        return {
          url: `/`,
          method: "GET",
          headers: {
            token: getToken(),
            lang: getLanguage(),
          },
        };
      },
      keepUnusedDataFor: 30,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    }),
    cancelMyOrder: builder.mutation({
      query: (orderDetails) => {
        return {
          url: `/cancel`,
          method: "POST",
          headers: {
            token: getToken(),
            lang: getLanguage(),
          },
          body: orderDetails,
        };
      },
      keepUnusedDataFor: 0,
    }),

    generateInvoice: builder.mutation({
      query: (orderId) => {
        return {
          url: `/generate-invoice`,
          method: "POST",
          headers: {
            token: getToken(),
            lang: getLanguage(),
          },
          // isSerializable: false,
          // responseHandler: async (response) => {
          //   const contentType = response?.headers?.get("content-type");
          //   let file = await response.blob();
          //   console.log(file);
          //   return file;
          // handleExportDownload(file, contentType, "driver_sales_report");
          // },
          body: { orderId },
          responseHandler: (response) => response.blob(),
        };
      },
      keepUnusedDataFor: 0,
    }),
    getOrdersDetails: builder.mutation({
      query: (orderId) => {
        return {
          url: `/order-details`,
          method: "POST",
          headers: {
            token: getToken(),
            lang: getLanguage(),
          },
          body: orderId,
        };
      },
      keepUnusedDataFor: 3600,
    }),
  }),
});

export const {
  useGetMyOrdersQuery,
  useCancelMyOrderMutation,
  useGenerateInvoiceMutation,
  // useGetOrdersDetailsQuery,
  useGetOrdersDetailsMutation,
} = OrdersQuery;
