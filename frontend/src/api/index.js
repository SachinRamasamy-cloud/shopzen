import api from './axios.js';

export const vendorApi = {
  getProfile:     ()            => api.get('/vendors/profile'),
  updateProfile:  (formData)    => api.put('/vendors/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getDashboard:   ()            => api.get('/vendors/dashboard'),
  getProducts:    (params)      => api.get('/vendors/products', { params }),
  updateStock:    (id, data)    => api.put(`/vendors/products/${id}/stock`, data),
  getCoupons:     ()            => api.get('/vendors/coupons'),
  createCoupon:   (data)        => api.post('/vendors/coupons', data),
  deleteCoupon:   (id)          => api.delete(`/vendors/coupons/${id}`),
};

export const adminApi = {
  getDashboard:          ()       => api.get('/admin/dashboard'),
  getUsers:              (params) => api.get('/admin/users', { params }),
  toggleUser:            (id)     => api.put(`/admin/users/${id}/toggle`),
  getVendors:            (params) => api.get('/admin/vendors', { params }),
  approveVendor:         (id)     => api.put(`/admin/vendors/${id}/approve`),
  rejectVendor:          (id)     => api.put(`/admin/vendors/${id}/reject`),
  getDeliveryPartners:   (params) => api.get('/admin/delivery', { params }),
  approveDelivery:       (id)     => api.put(`/admin/delivery/${id}/approve`),
  getAllOrders:           (params) => api.get('/admin/orders', { params }),
  toggleProduct:         (id)     => api.put(`/admin/products/${id}/toggle`),
};

export const deliveryApi = {
  getDashboard:   ()              => api.get('/delivery/dashboard'),
  toggleOnline:   ()              => api.put('/delivery/toggle-online'),
  acceptOrder:    (orderId)       => api.put(`/delivery/orders/${orderId}/accept`),
  updateLocation: (data)          => api.put('/delivery/location', data),
  completeOrder:  (orderId)       => api.put(`/delivery/orders/${orderId}/complete`),
};

export const reviewApi = {
  getByProduct: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  create:       (formData)          => api.post('/reviews', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove:       (id)                => api.delete(`/reviews/${id}`),
};

export const userApi = {
  getWishlist:      ()        => api.get('/auth/me'),
  addToWishlist:    (id)      => api.post(`/auth/wishlist/${id}`),
  removeWishlist:   (id)      => api.delete(`/auth/wishlist/${id}`),
  updateProfile:    (data)    => api.put('/auth/profile', data),
  addAddress:       (data)    => api.post('/auth/address', data),
  removeAddress:    (id)      => api.delete(`/auth/address/${id}`),
  validateCoupon:   (data)    => api.post('/orders/coupon/validate', data),
};
