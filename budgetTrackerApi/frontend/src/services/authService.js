import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  getToken: () => localStorage.getItem('token'),
  
  setToken: (token) => localStorage.setItem('token', token)
};