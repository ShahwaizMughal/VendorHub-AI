import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../lib/axiosBaseQuery';
import { setCredentials, logOut } from '../slices/authSlice';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery({ baseUrl: '' }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (userData) => ({
        url: '/api/auth/register',
        method: 'POST',
        data: userData
      })
    }),

    login: builder.mutation({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        data: credentials
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.accessToken && data?.data?.user) {
            dispatch(
              setCredentials({
                user: data.data.user,
                accessToken: data.data.accessToken
              })
            );
          }
        } catch (err) {
          // Handled in component
        }
      }
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST'
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logOut());
          dispatch(authApi.util.resetApiState());
        }
      }
    }),

    refresh: builder.mutation({
      query: () => ({
        url: '/api/auth/refresh',
        method: 'POST'
      })
    }),

    verifyEmail: builder.mutation({
      query: (token) => ({
        url: `/api/auth/verify-email/${token}`,
        method: 'POST'
      })
    }),

    forgotPassword: builder.mutation({
      query: (data) => ({
        url: '/api/auth/forgot-password',
        method: 'POST',
        data
      })
    }),

    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: `/api/auth/reset-password/${token}`,
        method: 'POST',
        data: { password }
      })
    }),

    getMe: builder.query({
      query: () => ({
        url: '/api/users/me',
        method: 'GET'
      }),
      providesTags: ['User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.user) {
            dispatch(setCredentials({ user: data.data.user }));
          }
        } catch (err) {
          // Error handled in app initializer
        }
      }
    }),

    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/api/users/me',
        method: 'PATCH',
        data: profileData
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.user) {
            dispatch(setCredentials({ user: data.data.user }));
          }
        } catch (err) {
          // Handled in component
        }
      }
    }),

    uploadAvatar: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/api/users/me/avatar',
          method: 'POST',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };
      },
      invalidatesTags: ['User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.user) {
            dispatch(setCredentials({ user: data.data.user }));
          }
        } catch (err) {
          // Handled in component
        }
      }
    }),

    deleteAccount: builder.mutation({
      query: () => ({
        url: '/api/users/me',
        method: 'DELETE'
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logOut());
          dispatch(authApi.util.resetApiState());
        }
      }
    }),

    restoreAccount: builder.mutation({
      query: () => ({
        url: '/api/users/me/restore',
        method: 'POST'
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.user) {
            dispatch(setCredentials({ user: data.data.user }));
          }
        } catch (err) {
          // Handled in component
        }
      }
    })
  })
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useDeleteAccountMutation,
  useRestoreAccountMutation
} = authApi;
