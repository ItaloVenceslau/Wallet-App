// Profile Module

class ProfileManager {
    constructor() {
        this.user = auth.getUser();
    }

    render() {
        const container = document.getElementById('dashboardContainer');
        
        container.innerHTML = `
            <div class="app-layout">
                ${this.renderSidebar()}
                <div class="main-wrapper">
                    ${this.renderHeader()}
                    <main class="main-content">
                        <div class="page-header">
                            <div>
                                <h1>Profile Settings</h1>
                                <p>Manage your account settings</p>
                            </div>
                        </div>

                        <div class="profile-grid">
                            <div class="profile-card">
                                <div class="profile-header">
                                    <div class="profile-avatar-large">
                                        ${getInitials(this.user?.email || 'User')}
                                    </div>
                                    <h3>${this.user?.email || 'User'}</h3>
                                    <p>Member since ${new Date().getFullYear()}</p>
                                </div>
                            </div>

                            <div class="profile-card">
                                <h3>Account Information</h3>
                                <div class="info-row">
                                    <span class="info-label">Email:</span>
                                    <span class="info-value">${this.user?.email || 'Not set'}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Account Type:</span>
                                    <span class="info-value">Premium</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Member Since:</span>
                                    <span class="info-value">${new Date().toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div class="profile-card">
                                <h3>Statistics</h3>
                                <div class="stats-loading" id="userStats">Loading statistics...</div>
                            </div>

                            <div class="profile-card">
                                <h3>Actions</h3>
                                <div class="action-buttons">
                                    <button class="btn btn-outline btn-block" id="exportTransactionsBtn">
                                        <i class="fas fa-download"></i> Export Transactions (CSV)
                                    </button>
                                    <button class="btn btn-outline btn-block" id="changePasswordBtn">
                                        <i class="fas fa-key"></i> Change Password
                                    </button>
                                    <button class="btn btn-danger btn-block" id="deleteAccountBtn">
                                        <i class="fas fa-trash"></i> Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        `;

        this.loadUserStats();
        this.attachEvents();
    }

    async loadUserStats() {
        try {
            const data = await api.getTransactions();
            const transactions = data.transactions || [];
            
            const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            
            const statsHtml = `
                <div class="info-row">
                    <span class="info-label">Total Transactions:</span>
                    <span class="info-value">${transactions.length}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Total Income:</span>
                    <span class="info-value positive">${formatCurrency(totalIncome)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Total Expenses:</span>
                    <span class="info-value negative">${formatCurrency(totalExpenses)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Net Balance:</span>
                    <span class="info-value ${totalIncome - totalExpenses >= 0 ? 'positive' : 'negative'}">
                        ${formatCurrency(totalIncome - totalExpenses)}
                    </span>
                </div>
            `;
            
            document.getElementById('userStats').innerHTML = statsHtml;
        } catch (error) {
            document.getElementById('userStats').innerHTML = '<p class="text-muted">Unable to load statistics</p>';
        }
    }

    renderSidebar() {
        return `
            <aside class="sidebar">
                <div class="logo-area">
                    <div class="logo-icon"><i class="fas fa-wallet"></i></div>
                    <span class="logo-text">WalletApiAPI</span>
                </div>
                <ul class="nav-menu">
                    <li class="nav-item"><a href="#" class="nav-link" data-page="dashboard"><i class="fas fa-tachometer-alt"></i><span>Dashboard</span></a></li>
                    <li class="nav-item"><a href="#" class="nav-link" data-page="transactions"><i class="fas fa-exchange-alt"></i><span>Transactions</span></a></li>
                    <li class="nav-item"><a href="#" class="nav-link active" data-page="profile"><i class="fas fa-user"></i><span>Profile</span></a></li>
                    <li class="nav-section">Support</li>
                    <li class="nav-item"><a href="#" class="nav-link" id="logoutBtn"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a></li>
                </ul>
            </aside>
        `;
    }

    renderHeader() {
        const user = auth.getUser();
        return `
            <header class="app-header">
                <button class="toggle-sidebar" id="toggleSidebarBtn"><i class="fas fa-bars"></i></button>
                <div class="header-right">
                    <div class="user-info">
                        <div class="avatar">${getInitials(user?.email || 'User')}</div>
                        <span>${user?.email || 'User'}</span>
                    </div>
                </div>
            </header>
        `;
    }

    attachEvents() {
        document.getElementById('toggleSidebarBtn')?.addEventListener('click', () => {
            document.querySelector('.sidebar')?.classList.toggle('collapsed');
        });

        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
            location.reload();
        });

        document.getElementById('exportTransactionsBtn')?.addEventListener('click', async () => {
            try {
                const data = await api.getTransactions();
                const transactions = data.transactions || [];
                downloadAsCSV(transactions, `transactions_${new Date().toISOString().split('T')[0]}.csv`);
                showToast('Export started', 'success');
            } catch (error) {
                showToast('Error exporting transactions', 'error');
            }
        });

        document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
            showToast('Password change feature coming soon', 'info');
        });

        document.getElementById('deleteAccountBtn')?.addEventListener('click', () => {
            if (confirm('WARNING: This action cannot be undone. Are you sure you want to delete your account?')) {
                showToast('Account deletion feature coming soon', 'info');
            }
        });

        document.querySelectorAll('.nav-link[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                if (page === 'dashboard') window.navigateToPage('dashboard');
                else if (page === 'transactions') window.navigateToPage('transactions');
                else if (page === 'profile') window.navigateToPage('profile');
            });
        });
    }
}

let profileManager = null;