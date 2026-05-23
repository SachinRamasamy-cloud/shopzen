import axios from 'axios';
import { store } from '../app/store.js';
import { setCredentials, logout } from '../features/auth/authSlice.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach(p => error ? p.reject(error) : p.resolve(token));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then(token => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = store.getState().auth.refreshToken;
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
        { refreshToken }
      );

      const { accessToken, refreshToken: newRefresh } = data.data;
      const user = store.getState().auth.user;

      store.dispatch(setCredentials({ user, accessToken, refreshToken: newRefresh }));
      processQueue(null, accessToken);

      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      store.dispatch(logout());
      window.location.href = '/auth/login';
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
