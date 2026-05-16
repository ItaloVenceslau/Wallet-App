// Authentication Module

class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.user = null;
        this.init();
    }

    init() {
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        const userStr = localStorage.getItem(CONFIG.USER_KEY);
        
        if (token && userStr) {
            this.isAuthenticated = true;
            this.user = JSON.parse(userStr);
            api.setToken(token);
        }
    }

    async login(email, password) {
        try {
            const data = await api.login({ email, password });
            
            if (data.token) {
                this.isAuthenticated = true;
                this.user = { email };
                api.setToken(data.token);
                localStorage.setItem(CONFIG.USER_KEY, JSON.stringify({ email }));
                showToast('Login successful!', 'success');
                return true;
            }
            return false;
        } catch (error) {
            showToast(error.message, 'error');
            return false;
        }
    }

    async register(name, email, password) {
        try {
            const data = await api.register({ name, email, password });
            
            if (data.token) {
                this.isAuthenticated = true;
                this.user = { name, email };
                api.setToken(data.token);
                localStorage.setItem(CONFIG.USER_KEY, JSON.stringify({ name, email }));
                showToast('Registration successful!', 'success');
                return true;
            }
            return false;
        } catch (error) {
            showToast(error.message, 'error');
            return false;
        }
    }

    logout() {
        this.isAuthenticated = false;
        this.user = null;
        api.setToken(null);
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
        showToast('Logged out successfully', 'success');
        return true;
    }

    isLoggedIn() {
        return this.isAuthenticated && !!api.getToken();
    }

    getUser() {
        return this.user;
    }
}

const auth = new Auth();