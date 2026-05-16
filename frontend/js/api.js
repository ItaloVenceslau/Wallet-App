// API Configuration
const API_URL = process.env.BACKEND;

const api = {
    async request(endpoint, method = 'GET', data = null, requiresAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (requiresAuth) {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers,
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_URL}${endpoint}`, config);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || result.error || 'Request failed');
        }

        return result;
    },

    // Auth endpoints (no token required)
    register(userData) {
        return this.request('/auth/register', 'POST', userData, false);
    },

    login(credentials) {
        return this.request('/auth/login', 'POST', credentials, false);
    },

    // Transaction endpoints (token required)
    getTransactions() {
        return this.request('/transactions');
    },

    createTransaction(transactionData) {
        return this.request('/transactions', 'POST', transactionData);
    },

    updateTransaction(id, transactionData) {
        return this.request(`/transactions/${id}`, 'PUT', transactionData);
    },

    deleteTransaction(id) {
        return this.request(`/transactions/${id}`, 'DELETE');
    },

    getMonthlySummary(month, year) {
        return this.request(`/transactions/summary/monthly?month=${month}&year=${year}`);
    }
};