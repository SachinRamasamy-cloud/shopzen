import api from './axios.js';

export const orderApi = {
  createCheckout: (data)        => api.post('/orders/checkout', data),
  getMyOrders:    (params)      => api.get('/orders/my', { params }),
  getOrder:       (id)          => api.get(`/orders/${id}`),
  updateStatus:   (id, data)    => api.put(`/orders/${id}/status`, data),
  getVendorOrders:(params)      => api.get('/orders/vendor', { params }),
};
