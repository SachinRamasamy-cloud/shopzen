import { createSlice } from '@reduxjs/toolkit';

const stored = (() => {
  try {
    return {
      user:         JSON.parse(localStorage.getItem('user') || 'null'),
      accessToken:  localStorage.getItem('accessToken') || null,
      refreshToken: localStorage.getItem('refreshToken') || null,
    };
  } catch { return { user: null, accessToken: null, refreshToken: null }; }
})();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:         stored.user,
    accessToken:  stored.accessToken,
    refreshToken: stored.refreshToken,
    loading:      false,
    error:        null,
  },
  reducers: {
    setCredentials(state, { payload }) {
      state.user         = payload.user;
      state.accessToken  = payload.accessToken;
      state.refreshToken = payload.refreshToken;
      localStorage.setItem('user',         JSON.stringify(payload.user));
      localStorage.setItem('accessToken',  payload.accessToken);
      localStorage.setItem('refreshToken', payload.refreshToken);
    },
    updateUser(state, { payload }) {
      state.user = { ...state.user, ...payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    setLoading(state, { payload }) { state.loading = payload; },
    setError(state, { payload })   { state.error   = payload; },
  },
});

export const { setCredentials, updateUser, logout, setLoading, setError } = authSlice.actions;
export const selectAuth        = (s) => s.auth;
export const selectUser        = (s) => s.auth.user;
export const selectAccessToken = (s) => s.auth.accessToken;
export const selectIsAuth      = (s) => !!s.auth.user;

export default authSlice.reducer;
