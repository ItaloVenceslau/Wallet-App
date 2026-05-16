// Main Application Controller

let currentPage = 'dashboard';

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

async function navigateToPage(page) {
    currentPage = page;
    const container = document.getElementById('dashboardContainer');
    
    if (!container) return;
    
    if (page === 'dashboard') {
        if (!dashboardInstance) {
            dashboardInstance = new Dashboard();
        }
        await dashboardInstance.load();
    } else if (page === 'transactions') {
        if (!transactionsManager) {
            transactionsManager = new TransactionsManager();
        }
        await transactionsManager.load();
    } else if (page === 'profile') {
        if (!profileManager) {
            profileManager = new ProfileManager();
        }
        profileManager.render();
    }
}

// Make functions global
window.navigateToPage = navigateToPage;
window.closeModal = closeModal;

// Initialize app
async function init() {
    if (auth.isLoggedIn()) {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('dashboardContainer').style.display = 'block';
        await navigateToPage('dashboard');
    } else {
        document.getElementById('authContainer').style.display = 'flex';
        document.getElementById('dashboardContainer').style.display = 'none';
        setupAuthForms();
    }
}

function setupAuthForms() {
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
            document.getElementById(`${tabName}Form`).classList.add('active');
        });
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            showToast('Please fill all fields', 'error');
            return;
        }
        
        const success = await auth.login(email, password);
        if (success) {
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('dashboardContainer').style.display = 'block';
            await navigateToPage('dashboard');
        }
    });

    // Register form
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        if (!name || !email || !password) {
            showToast('Please fill all fields', 'error');
            return;
        }
        
        if (password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }
        
        const success = await auth.register(name, email, password);
        if (success) {
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('dashboardContainer').style.display = 'block';
            await navigateToPage('dashboard');
        }
    });

    // Forgot password
    document.getElementById('forgotPassword')?.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Password reset feature coming soon', 'info');
    });
}

// Start the app
init();