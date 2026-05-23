import api from './axios.js';

export const authApi = {
  register:       (data)          => api.post('/auth/register', data),
  verifyOTP:      (data)          => api.post('/auth/verify-otp', data),
  resendOTP:      (data)          => api.post('/auth/resend-otp', data),
  login:          (data)          => api.post('/auth/login', data),
  googleLogin:    (data)          => api.post('/auth/google', data),
  refresh:        (data)          => api.post('/auth/refresh', data),
  forgotPassword: (data)          => api.post('/auth/forgot-password', data),
  resetPassword:  (data)          => api.post('/auth/reset-password', data),
  getMe:          ()              => api.get('/auth/me'),
};
