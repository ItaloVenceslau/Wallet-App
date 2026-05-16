import { CONFIG } from './config.js';

export const API = {
  // Executes HTTP calls and automatically appends the Bearer token for security
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      // If the token is invalid or expired (401), clear storage and redirect to login
      if (response.status === 401 && !endpoint.includes('/auth')) {
        localStorage.clear();
        window.location.href = '/pages/login.html';
      }
      throw new Error(data.error || data.message || 'Something went wrong with the request');
    }

    return data;
  },

  get(endpoint) { return this.request(endpoint, { method: 'GET' }); },
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); },
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); },
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
};
