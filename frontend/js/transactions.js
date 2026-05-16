// Transactions Module

class TransactionsManager {
    constructor() {
        this.transactions = [];
        this.filterType = 'all';
        this.searchTerm = '';
        this.sortBy = 'date';
        this.sortOrder = 'desc';
    }

    async load() {
        await this.fetchTransactions();
        this.render();
    }

    async fetchTransactions() {
        try {
            const data = await api.getTransactions();
            this.transactions = data.transactions || [];
        } catch (error) {
            console.error('Error fetching transactions:', error);
            this.transactions = [];
        }
    }

    getFilteredTransactions() {
        let filtered = [...this.transactions];

        // Filter by type
        if (this.filterType !== 'all') {
            filtered = filtered.filter(t => t.type === this.filterType);
        }

        // Filter by search
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(t => 
                t.title.toLowerCase().includes(term) ||
                t.category.toLowerCase().includes(term) ||
                (t.note && t.note.toLowerCase().includes(term))
            );
        }

        // Sort
        filtered.sort((a, b) => {
            let aVal, bVal;
            if (this.sortBy === 'date') {
                aVal = new Date(a.date);
                bVal = new Date(b.date);
            } else if (this.sortBy === 'amount') {
                aVal = a.amount;
                bVal = b.amount;
            } else {
                aVal = a[this.sortBy];
                bVal = b[this.sortBy];
            }
            
            if (this.sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return filtered;
    }

    getStats() {
        const filtered = this.getFilteredTransactions();
        const totalIncome = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        return {
            total: filtered.length,
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses
        };
    }

    render() {
        const container = document.getElementById('dashboardContainer');
        const stats = this.getStats();
        const filtered = this.getFilteredTransactions();

        container.innerHTML = `
            <div class="app-layout">
                ${this.renderSidebar()}
                <div class="main-wrapper">
                    ${this.renderHeader()}
                    <main class="main-content">
                        <div class="page-header">
                            <div>
                                <h1>Transactions</h1>
                                <p>Manage your financial transactions</p>
                            </div>
                            <button class="btn btn-primary" onclick="window.openAddTransactionModal()">
                                <i class="fas fa-plus"></i> Add Transaction
                            </button>
                        </div>

                        <div class="stats-row">
                            <div class="stat-mini">
                                <span class="stat-label">Total Transactions</span>
                                <span class="stat-number">${stats.total}</span>
                            </div>
                            <div class="stat-mini">
                                <span class="stat-label">Total Income</span>
                                <span class="stat-number positive">${formatCurrency(stats.totalIncome)}</span>
                            </div>
                            <div class="stat-mini">
                                <span class="stat-label">Total Expenses</span>
                                <span class="stat-number negative">${formatCurrency(stats.totalExpenses)}</span>
                            </div>
                            <div class="stat-mini">
                                <span class="stat-label">Balance</span>
                                <span class="stat-number ${stats.balance >= 0 ? 'positive' : 'negative'}">${formatCurrency(stats.balance)}</span>
                            </div>
                        </div>

                        <div class="filters-bar">
                            <div class="filter-group">
                                <button class="filter-btn ${this.filterType === 'all' ? 'active' : ''}" data-filter="all">All</button>
                                <button class="filter-btn ${this.filterType === 'income' ? 'active' : ''}" data-filter="income">Income</button>
                                <button class="filter-btn ${this.filterType === 'expense' ? 'active' : ''}" data-filter="expense">Expense</button>
                            </div>
                            <div class="search-box">
                                <i class="fas fa-search"></i>
                                <input type="text" id="searchInput" placeholder="Search transactions..." value="${escapeHtml(this.searchTerm)}">
                            </div>
                        </div>

                        <div class="table-container">
                            ${this.renderTransactionsTable(filtered)}
                        </div>
                    </main>
                </div>
            </div>
        `;

        this.attachEvents();
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
                    <li class="nav-item"><a href="#" class="nav-link active" data-page="transactions"><i class="fas fa-exchange-alt"></i><span>Transactions</span></a></li>
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

    renderTransactionsTable(transactions) {
        if (transactions.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No transactions found</p>
                    <button class="btn btn-primary btn-sm" onclick="window.openAddTransactionModal()">Add Transaction</button>
                </div>
            `;
        }

        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="sortable" data-sort="title">Title <i class="fas fa-sort"></i></th>
                        <th class="sortable" data-sort="amount">Amount <i class="fas fa-sort"></i></th>
                        <th>Type</th>
                        <th class="sortable" data-sort="category">Category <i class="fas fa-sort"></i></th>
                        <th class="sortable" data-sort="date">Date <i class="fas fa-sort"></i></th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(t => `
                        <tr>
                            <td><strong>${escapeHtml(t.title)}</strong>${t.note ? `<br><small class="text-muted">${escapeHtml(t.note.substring(0, 50))}</small>` : ''}</td>
                            <td class="${t.type === 'income' ? 'text-success' : 'text-danger'} fw-bold">
                                ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
                            </td>
                            <td><span class="badge ${t.type === 'income' ? 'badge-success' : 'badge-danger'}">${t.type}</span></td>
                            <td>${escapeHtml(t.category)}</td>
                            <td>${formatDate(t.date)}</td>
                            <td>
                                <button class="btn-icon-sm" onclick="window.editTransaction('${t._id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon-sm text-danger" onclick="window.deleteTransactionById('${t._id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    attachEvents() {
        // Sidebar toggle
        document.getElementById('toggleSidebarBtn')?.addEventListener('click', () => {
            document.querySelector('.sidebar')?.classList.toggle('collapsed');
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
            location.reload();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterType = btn.dataset.filter;
                this.render();
            });
        });

        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.searchTerm = e.target.value;
                this.render();
            }, 300));
        }

        // Sorting
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const sort = th.dataset.sort;
                if (this.sortBy === sort) {
                    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortBy = sort;
                    this.sortOrder = 'asc';
                }
                this.render();
            });
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

    async refresh() {
        await this.fetchTransactions();
        this.render();
    }
}

// Global functions for modals
window.openAddTransactionModal = () => {
    const modal = document.getElementById('transactionModal');
    document.getElementById('modalTitle').textContent = 'Add Transaction';
    document.getElementById('transactionForm').reset();
    document.getElementById('transactionId').value = '';
    document.getElementById('transDate').valueAsDate = new Date();
    modal.classList.add('show');
};

window.editTransaction = async (id) => {
    try {
        const data = await api.getTransactionById(id);
        const t = data.transaction;
        document.getElementById('modalTitle').textContent = 'Edit Transaction';
        document.getElementById('transactionId').value = t._id;
        document.getElementById('transTitle').value = t.title;
        document.getElementById('transAmount').value = t.amount;
        document.getElementById('transType').value = t.type;
        document.getElementById('transCategory').value = t.category;
        document.getElementById('transDate').value = t.date.split('T')[0];
        document.getElementById('transNote').value = t.note || '';
        document.getElementById('transactionModal').classList.add('show');
    } catch (error) {
        showToast('Error loading transaction', 'error');
    }
};

window.saveTransaction = async () => {
    const id = document.getElementById('transactionId').value;
    const transaction = {
        title: document.getElementById('transTitle').value,
        amount: parseFloat(document.getElementById('transAmount').value),
        type: document.getElementById('transType').value,
        category: document.getElementById('transCategory').value,
        date: document.getElementById('transDate').value,
        note: document.getElementById('transNote').value
    };

    if (!transaction.title || !transaction.amount || !transaction.category || !transaction.date) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    try {
        if (id) {
            await api.updateTransaction(id, transaction);
            showToast('Transaction updated successfully', 'success');
        } else {
            await api.createTransaction(transaction);
            showToast('Transaction created successfully', 'success');
        }
        
        closeModal('transactionModal');
        
        // Refresh current page
        if (window.currentPage === 'dashboard') {
            await dashboardInstance.load();
        } else if (window.currentPage === 'transactions') {
            await window.transactionsManager.refresh();
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
};

window.deleteTransactionById = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
        await api.deleteTransaction(id);
        showToast('Transaction deleted successfully', 'success');
        
        if (window.currentPage === 'dashboard') {
            await dashboardInstance.load();
        } else if (window.currentPage === 'transactions') {
            await window.transactionsManager.refresh();
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
};

let transactionsManager = null;