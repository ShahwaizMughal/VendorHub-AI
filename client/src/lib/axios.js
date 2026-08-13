import axios from 'axios';

/**
 * General-purpose authenticated axios instance, used by page components
 * that call the API directly (outside RTK Query), e.g. BuyerSearchPage.
 *
 * Reads the current access token from the Redux store the same way
 * `axiosBaseQuery.js` does. Kept as a separate lightweight instance rather
 * than merging into axiosBaseQuery.js, since that file already carries the
 * more complex 401-refresh-retry logic used specifically by RTK Query
 * mutations/queries; this one is for plain one-off calls.
 */
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const state = window.__REDUX_STORE__?.getState();
  const token = state?.auth?.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
