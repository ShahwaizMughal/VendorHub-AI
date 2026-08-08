import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const rfqApi = createApi({
  reducerPath: "rfqApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.accessToken || localStorage.getItem("accessToken");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["RFQ", "Quote", "Order"],
  endpoints: builder => ({
    createRfq: builder.mutation({
      query: body => ({ url: "/rfqs", method: "POST", body }),
      invalidatesTags: ["RFQ"],
    }),
    getRfq: builder.query({
      query: id => `/rfqs/${id}`,
      providesTags: (_, __, id) => [{ type: "RFQ", id }],
    }),
    getMatchSuggestions: builder.query({
      query: id => `/rfqs/${id}/match-suggestions`,
      providesTags: (_, __, id) => [{ type: "RFQ", id: `MATCH-${id}` }],
    }),
    getQuotes: builder.query({
      query: id => `/rfqs/${id}/quotes`,
      providesTags: (_, __, id) => [{ type: "Quote", id }],
    }),
    submitQuote: builder.mutation({
      query: body => ({ url: "/quotes", method: "POST", body }),
      invalidatesTags: (_, __, body) => ["Quote", { type: "RFQ", id: body.rfqId }],
    }),
    acceptQuote: builder.mutation({
      query: id => ({ url: `/quotes/${id}/accept`, method: "POST" }),
      invalidatesTags: ["Quote", "RFQ", "Order"],
    }),
    getOrders: builder.query({
      query: () => "/orders",
      providesTags: result => result
        ? [{ type: "Order", id: "LIST" }, ...result.data.map(order => ({ type: "Order", id: order._id }))]
        : [{ type: "Order", id: "LIST" }],
    }),
    getOrder: builder.query({
      query: id => `/orders/${id}`,
      providesTags: (_, __, id) => [{ type: "Order", id }],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status, note }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        body: { status, note },
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Order", id }, { type: "Order", id: "LIST" }],
    }),
  }),
});

export const {
  useCreateRfqMutation,
  useGetRfqQuery,
  useGetMatchSuggestionsQuery,
  useGetQuotesQuery,
  useSubmitQuoteMutation,
  useAcceptQuoteMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
} = rfqApi;
