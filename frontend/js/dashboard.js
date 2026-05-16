// Dashboard Module

class Dashboard {
    constructor() {
        this.currentMonth = new Date().getMonth() + 1;
        this.currentYear = new Date().getFullYear();
        this.summary = null;
        this.transactions = [];
        this.charts = {};
    }

    async load() {
        await this.loadSummary();
        await this.loadTransactions();
        this.render();
    }

    async loadSummary() {
        try {
            this.summary = await api.getMonthlySummary(this.currentMonth, this.currentYear);
        } catch (error) {
            console.error('Error loading summary:', error);
            this.summary = null;
        }
    }

    async loadTransactions() {
        try {
            const data = await api.getTransactions();
            this.transactions = data.transactions || [];
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.transactions = [];
        }
    }

    changeMonth(delta) {
        let newMonth = this.currentMonth + delta;
        let newYear = this.currentYear;

        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }

        this.currentMonth = newMonth;
        this.currentYear = newYear;
        this.load();
    }

    render() {
        const container = document.getElementById('dashboardContainer');
        const monthNames = getMonthNames();
        
        container.innerHTML = `
            <div class="app-layout">
                ${this.renderSidebar()}
                <div class="main-wrapper">
                    ${this.renderHeader()}
                    <main class="main-content">
                        <div class="page-header">
                            <div>
                                <h1>Dashboard</h1>
                                <p>Welcome back, ${auth.getUser()?.email || 'User'}!</p>
                            </div>
                            <div class="month-selector">
                                <button class="btn-icon" id="prevMonthBtn"><i class="fas fa-chevron-left"></i></button>
                                <h3>${monthNames[this.currentMonth - 1]} ${this.currentYear}</h3>
                                <button class="btn-icon" id="nextMonthBtn"><i class="fas fa-chevron-right"></i></button>
                            </div>
                        </div>

                        ${this.renderStatsCards()}
                        ${this.renderCharts()}
                        ${this.renderRecentTransactions()}
                    </main>
                </div>
            </div>
        `;

        this.attachEvents();
        this.renderChartsJS();
    }

    renderSidebar() {
        return `
            <aside class="sidebar">
                <div class="logo-area">
                    <div class="logo-icon"><i class="fas fa-wallet"></i></div>
                    <span class="logo-text">WalletApiAPI</span>
                </div>
                <ul class="nav-menu">
                    <li class="nav-item"><a href="#" class="nav-link active" data-page="dashboard"><i class="fas fa-tachometer-alt"></i><span>Dashboard</span></a></li>
                    <li class="nav-item"><a href="#" class="nav-link" data-page="transactions"><i class="fas fa-exchange-alt"></i><span>Transactions</span></a></li>
                    <li class="nav-item"><a href="#" class="nav-link" data-page="profile"><i class="fas fa-user"></i><span>Profile</span></a></li>
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

    renderStatsCards() {
        if (!this.summary) {
            return '<div class="loading">Loading statistics...</div>';
        }

        const totalIncome = this.summary.totalIncome || 0;
        const totalExpenses = this.summary.totalExpenses || 0;
        const balance = this.summary.balance || 0;

        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Total Income</span>
                        <div class="stat-icon income-bg"><i class="fas fa-arrow-up"></i></div>
                    </div>
                    <div class="stat-value positive">${formatCurrency(totalIncome)}</div>
                    <div class="stat-change">This month</div>
                </div>
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Total Expenses</span>
                        <div class="stat-icon expense-bg"><i class="fas fa-arrow-down"></i></div>
                    </div>
                    <div class="stat-value negative">${formatCurrency(totalExpenses)}</div>
                    <div class="stat-change">This month</div>
                </div>
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Net Balance</span>
                        <div class="stat-icon balance-bg"><i class="fas fa-chart-line"></i></div>
                    </div>
                    <div class="stat-value ${balance >= 0 ? 'positive' : 'negative'}">${formatCurrency(balance)}</div>
                    <div class="stat-change">${balance >= 0 ? 'Positive' : 'Negative'} balance</div>
                </div>
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Transactions</span>
                        <div class="stat-icon primary-bg"><i class="fas fa-list"></i></div>
                    </div>
                    <div class="stat-value">${this.summary.totalTransactions || 0}</div>
                    <div class="stat-change">Total transactions</div>
                </div>
            </div>
        `;
    }

    renderCharts() {
        return `
            <div class="charts-grid">
                <div class="chart-card">
                    <div class="chart-title">Income vs Expenses</div>
                    <canvas id="incomeExpenseChart" height="300"></canvas>
                </div>
                <div class="chart-card">
                    <div class="chart-title">Expenses by Category</div>
                    <canvas id="categoryChart" height="300"></canvas>
                </div>
            </div>
        `;
    }

    renderRecentTransactions() {
        const recent = [...this.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        
        if (recent.length === 0) {
            return `
                <div class="chart-card">
                    <div class="chart-title">Recent Transactions</div>
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No transactions yet</p>
                        <button class="btn btn-primary btn-sm" onclick="window.openAddTransactionModal()">Add Transaction</button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="chart-card">
                <div class="chart-title">Recent Transactions</div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr><th>Title</th><th>Amount</th><th>Category</th><th>Date</th><th></th>
                        </thead>
                        <tbody>
                            ${recent.map(t => `
                                <tr>
                                    <td><strong>${escapeHtml(t.title)}</strong></td>
                                    <td class="${t.type === 'income' ? 'text-success' : 'text-danger'}">
                                        ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
                                    </td>
                                    <td>${escapeHtml(t.category)}</td>
                                    <td>${formatDate(t.date)}</td>
                                    <td>
                                        <button class="btn-icon-sm" onclick="window.editTransaction('${t._id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="card-footer">
                    <a href="#" onclick="window.navigateToPage('transactions'); return false;">View All Transactions →</a>
                </div>
            </div>
        `;
    }

    renderChartsJS() {
        if (!this.summary) return;

        // Income vs Expense Chart
        const incomeExpenseCtx = document.getElementById('incomeExpenseChart')?.getContext('2d');
        if (incomeExpenseCtx && window.IncomeExpenseChart) {
            window.IncomeExpenseChart.destroy();
        }
        if (incomeExpenseCtx) {
            window.IncomeExpenseChart = new Chart(incomeExpenseCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Income', 'Expenses'],
                    datasets: [{
                        data: [this.summary.totalIncome || 0, this.summary.totalExpenses || 0],
                        backgroundColor: [CHART_COLORS.success, CHART_COLORS.danger],
                        borderWidth: 0,
                        borderRadius: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }

        // Category Chart
        const categoryCtx = document.getElementById('categoryChart')?.getContext('2d');
        const categories = this.summary.expensesByCategory || {};
        const labels = Object.keys(categories);
        const data = Object.values(categories);

        if (categoryCtx && window.CategoryChart) {
            window.CategoryChart.destroy();
        }
        if (categoryCtx && labels.length > 0) {
            window.CategoryChart = new Chart(categoryCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Amount Spent',
                        data: data,
                        backgroundColor: CHART_COLORS.primary,
                        borderRadius: 8,
                        barPercentage: 0.7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => formatCurrency(value)
                            }
                        }
                    }
                }
            });
        } else if (categoryCtx) {
            window.CategoryChart = new Chart(categoryCtx, {
                type: 'bar',
                data: {
                    labels: ['No Data'],
                    datasets: [{ data: [0] }]
                }
            });
        }
    }

    attachEvents() {
        document.getElementById('prevMonthBtn')?.addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonthBtn')?.addEventListener('click', () => this.changeMonth(1));
        
        document.getElementById('toggleSidebarBtn')?.addEventListener('click', () => {
            document.querySelector('.sidebar')?.classList.toggle('collapsed');
        });

        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
            location.reload();
        });

        // Navigation
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

let dashboardInstance = null;