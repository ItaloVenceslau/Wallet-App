import api from './api';

export const projectService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/projects${params ? `?${params}` : ''}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/projects', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
  
  addExpense: async (id, amount) => {
    const response = await api.patch(`/projects/${id}/add-expense`, { amount });
    return response.data;
  },
  
  updateStatus: async (id, status) => {
    const response = await api.patch(`/projects/${id}/status`, { status });
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/projects/stats/summary');
    return response.data;
  }
};