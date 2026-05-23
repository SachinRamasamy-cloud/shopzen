import api from './axios.js';

export const productApi = {
  getAll:      (params)       => api.get('/products', { params }),
  getOne:      (id)           => api.get(`/products/${id}`),
  getCategories: ()           => api.get('/products/categories'),
  create:      (formData)     => api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:      (id, formData) => api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:      (id)           => api.delete(`/products/${id}`),
  updateStock: (id, data)     => api.put(`/vendors/products/${id}/stock`, data),
};
