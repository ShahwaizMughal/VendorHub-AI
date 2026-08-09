import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: '' }) =>
  async ({ url, method, data, params, headers }) => {
    try {
      const state = window.__REDUX_STORE__?.getState();
      const token = state?.auth?.accessToken;

      const config = {
        url: baseUrl + url,
        method,
        data,
        params,
        headers: {
          ...headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      };

      const result = await api(config);
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError;

      // Handle 401 token refresh retry
      if (
        err.response?.status === 401 &&
        !err.config._retry &&
        !url.includes('/api/auth/login') &&
        !url.includes('/api/auth/refresh')
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              err.config.headers['Authorization'] = `Bearer ${newToken}`;
              return api(err.config).then((res) => ({ data: res.data }));
            })
            .catch((refreshErr) => {
              return {
                error: {
                  status: refreshErr.response?.status,
                  data: refreshErr.response?.data || refreshErr.message
                }
              };
            });
        }

        err.config._retry = true;
        isRefreshing = true;

        try {
          const refreshResult = await api.post('/api/auth/refresh');
          const newAccessToken = refreshResult.data?.data?.accessToken;

          if (newAccessToken) {
            window.__REDUX_STORE__?.dispatch({
              type: 'auth/setCredentials',
              payload: { accessToken: newAccessToken }
            });

            processQueue(null, newAccessToken);
            err.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
            const retryRes = await api(err.config);
            return { data: retryRes.data };
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          window.__REDUX_STORE__?.dispatch({ type: 'auth/logOut' });
          return {
            error: {
              status: refreshError.response?.status || 401,
              data: refreshError.response?.data || { message: 'Session expired' }
            }
          };
        } finally {
          isRefreshing = false;
        }
      }

      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || { message: err.message }
        }
      };
    }
  };

export default api;
