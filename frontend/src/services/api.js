import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

export const rfpAPI = {
  createFromNL: (userInput) => api.post('/rfps/create-from-nl', { userInput }),
  getAll: (status) => api.get('/rfps', { params: { status } }),
  getById: (id) => api.get(`/rfps/${id}`),
  update: (id, data) => api.put(`/rfps/${id}`, data),
  delete: (id) => api.delete(`/rfps/${id}`),
  send: (id, vendorIds) => api.post(`/rfps/${id}/send`, { vendorIds }),
  getProposals: (id) => api.get(`/rfps/${id}/proposals`)
};

export const vendorAPI = {
  create: (data) => api.post('/vendors', data),
  getAll: () => api.get('/vendors'),
  getById: (id) => api.get(`/vendors/${id}`),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`)
};

export const proposalAPI = {
  getByRFP: (rfpId) => api.get(`/proposals/rfp/${rfpId}`),
  getById: (id) => api.get(`/proposals/${id}`),
  compare: (rfpId, proposalIds) => api.post('/proposals/compare', { rfpId, proposalIds }),
  updateStatus: (id, status) => api.put(`/proposals/${id}/status`, { status })
};

export default api;
