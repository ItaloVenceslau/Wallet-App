import { API } from './api.js';

export const Auth = {
  // Triggers the POST /auth/login route and stores the session token
  async login(email, password) {
    const data = await API.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  // Triggers the POST /auth/register route linked to your backend validation rules
  async register(name, email, password) {
    return await API.post('/auth/register', { name, email, password });
  },

  // Completely clears cookies/localStorage and sends user back to Sign In screen
  logout() {
    localStorage.clear();
    window.location.href = '/pages/login.html';
  },

  // Guards safe views (Dashboard / Transactions) from unauthenticated users
  checkGuard() {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/pages/login.html';
    }
  },

  // Prevents logged-in users from going back to Login or Register forms
  checkGuestGuard() {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/pages/dashboard.html';
    }
  }
};
