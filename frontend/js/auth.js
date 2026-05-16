import { API } from './api.js';

export const Auth = {
  async login(email, password) {
    const data = await API.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      
      // Tentar extrair nome do token ou buscar do backend
      try {
        const base64Url = data.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        
        // Se tiver nome no token, salva
        if (decoded.name) {
          localStorage.setItem('userFirstName', decoded.name.split(' ')[0]);
        } else {
          // Se não, salvar um placeholder (você pode buscar do backend)
          localStorage.setItem('userFirstName', 'User');
        }
      } catch (error) {
        localStorage.setItem('userFirstName', 'User');
      }
    }
    return data;
  },

  async register(name, email, password) {
    const data = await API.post('/auth/register', { name, email, password });
    return data;
  },

  logout() {
    localStorage.removeItem('userFirstName');
    localStorage.clear();
    window.location.href = '/pages/login.html';
  },

  checkGuard() {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/pages/login.html';
    }
  },

  checkGuestGuard() {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/pages/dashboard.html';
    }
  }
};