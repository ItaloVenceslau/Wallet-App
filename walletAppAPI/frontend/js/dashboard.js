// Load dashboard data
let currentMonth = new Date().getMonth() + 1;
let currentYear = new Date().getFullYear();

async function loadDashboard() {
    await loadTransactions();
    await loadSummary();
}

let allTransactions = [];
let currentFilters = {
    month: 'all',
    category: 'all',
    search: ''
};

async function loadTransactions() {
    try {
        const result = await api.getTransactions();
        allTransactions = result.transactions || [];
        applyFilters();
    } catch (error) {
        showAlert('Error loading transactions: ' + error.message, 'error');
    }
}

function applyFilters() {
    currentFilters = {
        month: document.getElementById('filterMonth').value,
        category: document.getElementById('filterCategory').value,
        search: document.getElementById('searchTitle').value.toLowerCase()
    };
    
    let filtered = [...allTransactions];
    
    // Filter by month
    if (currentFilters.month !== 'all') {
        filtered = filtered.filter(t => {
            const transactionMonth = new Date(t.date).getMonth() + 1;
            return transactionMonth === parseInt(currentFilters.month);
        });
    }
    
    // Filter by category
    if (currentFilters.category !== 'all') {
        filtered = filtered.filter(t => t.category === currentFilters.category);
    }
    
    // Filter by search
    if (currentFilters.search) {
        filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(currentFilters.search) ||
            (t.note && t.note.toLowerCase().includes(currentFilters.search))
        );
    }
    
    displayTransactions(filtered);
    updateFilteredSummary(filtered);
}

function clearFilters() {
    document.getElementById('filterMonth').value = 'all';
    document.getElementById('filterCategory').value = 'all';
    document.getElementById('searchTitle').value = '';
    applyFilters();
}

function updateFilteredSummary(transactions) {
    let income = 0;
    let expenses = 0;
    const byCategory = {};
    
    transactions.forEach(t => {
        if (t.type === 'income') {
            income += t.amount;
        } else {
            expenses += t.amount;
            byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
        }
    });
    
    const balance = income - expenses;
    
    document.getElementById('totalIncome').textContent = `R$ ${income.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `R$ ${expenses.toFixed(2)}`;
    document.getElementById('balance').textContent = `R$ ${balance.toFixed(2)}`;
    
    const balanceElement = document.getElementById('balance');
    if (balance < 0) {
        balanceElement.style.color = '#ef4444';
    } else {
        balanceElement.style.color = '#10b981';
    }
    
    displayCategories(byCategory);
    createExpenseChart(byCategory);
}

// Update existing displayTransactions to show filtered data
function displayTransactions(transactions) {
    const container = document.getElementById('transactionsList');
    
    if (!transactions.length) {
        container.innerHTML = '<div class="empty-state">No transactions match your filters</div>';
        return;
    }
    
    container.innerHTML = transactions.map(transaction => `
        <div class="transaction-item" data-id="${transaction._id}">
            <div class="transaction-info">
                <div class="transaction-title">${escapeHtml(transaction.title)}</div>
                <div class="transaction-meta">
                    ${transaction.category} • ${new Date(transaction.date).toLocaleDateString()}
                    ${transaction.note ? ` • ${escapeHtml(transaction.note)}` : ''}
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'} R$ ${transaction.amount.toFixed(2)}
            </div>
            <div class="transaction-actions">
                <button class="btn btn-small btn-secondary" onclick="editTransaction('${transaction._id}')">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteTransaction('${transaction._id}')">Delete</button>
            </div>
        </div>
    `).join('');
};

async function loadSummary() {
    try {
        const summary = await api.getMonthlySummary(currentMonth, currentYear);
        displaySummary(summary);
    } catch (error) {
        console.error('Error loading summary:', error);
    }
}

function displaySummary(summary) {
    // Update stats
    document.getElementById('totalIncome').textContent = `R$ ${summary.totalIncome?.toFixed(2) || '0.00'}`;
    document.getElementById('totalExpenses').textContent = `R$ ${summary.totalExpenses?.toFixed(2) || '0.00'}`;
    document.getElementById('balance').textContent = `R$ ${summary.balance?.toFixed(2) || '0.00'}`;
    
    const balanceElement = document.getElementById('balance');
    if (summary.balance < 0) {
        balanceElement.style.color = '#ef4444';
    } else {
        balanceElement.style.color = '#10b981';
    }
    
    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonth').textContent = `${monthNames[currentMonth - 1]} ${currentYear}`;
    
    // Display categories
    displayCategories(summary.expensesByCategory || {});

    let expenseChart = null;

function displaySummary(summary) {
    // ... existing code ...
    
    // Create/update chart
    createExpenseChart(summary.expensesByCategory || {});
}

function createExpenseChart(categories) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const labels = Object.keys(categories);
    const data = Object.values(categories);
    
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    if (labels.length === 0) {
        return;
    }
    
    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#6366f1', '#10b981', '#f59e0b', '#ef4444', 
                    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: R$ ${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}
}

function displayCategories(categories) {
    const container = document.getElementById('categoriesList');
    const entries = Object.entries(categories);
    
    if (!entries.length) {
        container.innerHTML = '<div class="empty-state">No expenses this month</div>';
        return;
    }
    
    container.innerHTML = entries.map(([category, amount]) => `
        <div class="category-item">
            <span class="category-name">${escapeHtml(category)}</span>
            <span class="category-amount">R$ ${amount.toFixed(2)}</span>
        </div>
    `).join('');
}

// Create transaction
const transactionForm = document.getElementById('transactionForm');
if (transactionForm) {
    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const transactionData = {
            title: document.getElementById('title').value,
            amount: parseFloat(document.getElementById('amount').value),
            type: document.getElementById('type').value,
            category: document.getElementById('category').value,
            date: document.getElementById('date').value,
            note: document.getElementById('note').value || undefined
        };
        
        try {
            await api.createTransaction(transactionData);
            showAlert('Transaction created successfully!', 'success');
            transactionForm.reset();
            loadDashboard();
        } catch (error) {
            showAlert('Error creating transaction: ' + error.message, 'error');
        }
    });
}

// Delete transaction
async function deleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
        await api.deleteTransaction(id);
        showAlert('Transaction deleted successfully!', 'success');
        loadDashboard();
    } catch (error) {
        showAlert('Error deleting transaction: ' + error.message, 'error');
    }
}

// Edit transaction
async function editTransaction(id) {
    const newAmount = prompt('Enter new amount:');
    if (!newAmount) return;
    
    try {
        await api.updateTransaction(id, { amount: parseFloat(newAmount) });
        showAlert('Transaction updated successfully!', 'success');
        loadDashboard();
    } catch (error) {
        showAlert('Error updating transaction: ' + error.message, 'error');
    }
}

// Month navigation
function previousMonth() {
    if (currentMonth === 1) {
        currentMonth = 12;
        currentYear--;
    } else {
        currentMonth--;
    }
    loadSummary();
}

function nextMonth() {
    if (currentMonth === 12) {
        currentMonth = 1;
        currentYear++;
    } else {
        currentMonth++;
    }
    loadSummary();
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load dashboard on page load
if (window.location.pathname.includes('dashboard.html')) {
    loadDashboard();
}

async function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Title
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const title = `Wallet Report - ${monthNames[currentMonth - 1]} ${currentYear}`;
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    
    // Get summary data
    const income = document.getElementById('totalIncome').textContent;
    const expenses = document.getElementById('totalExpenses').textContent;
    const balance = document.getElementById('balance').textContent;
    
    // Add summary
    doc.setFontSize(12);
    doc.text(`Total Income: ${income}`, 20, 40);
    doc.text(`Total Expenses: ${expenses}`, 20, 50);
    doc.text(`Balance: ${balance}`, 20, 60);
    
    // Add transactions
    doc.text('Recent Transactions:', 20, 80);
    let y = 90;
    const transactions = allTransactions.filter(t => {
        const transactionMonth = new Date(t.date).getMonth() + 1;
        return transactionMonth === currentMonth && new Date(t.date).getFullYear() === currentYear;
    });
    
    transactions.slice(0, 10).forEach(t => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        doc.text(`${t.title} - ${t.type === 'income' ? '+' : '-'} R$ ${t.amount.toFixed(2)}`, 20, y);
        y += 10;
    });
    
    doc.save(`wallet_report_${currentMonth}_${currentYear}.pdf`);
    showAlert('PDF exported successfully!', 'success');
}

// Load budgets from localStorage
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};

function setBudget() {
    const category = document.getElementById('budgetCategory').value;
    const amount = parseFloat(document.getElementById('budgetAmount').value);
    
    if (isNaN(amount) || amount <= 0) {
        showAlert('Please enter a valid amount', 'error');
        return;
    }
    
    budgets[category] = amount;
    localStorage.setItem('budgets', JSON.stringify(budgets));
    showAlert(`Budget for ${category} set to R$ ${amount.toFixed(2)}`, 'success');
    displayBudgetStatus();
    document.getElementById('budgetAmount').value = '';
}

function displayBudgetStatus() {
    const container = document.getElementById('budgetStatus');
    const summary = window.currentSummary || { expensesByCategory: {} };
    const expenses = summary.expensesByCategory || {};
    
    if (Object.keys(budgets).length === 0) {
        container.innerHTML = '<p>No budgets set yet. Set budgets above to track spending limits.</p>';
        return;
    }
    
    let html = '<div class="category-grid">';
    for (const [category, budget] of Object.entries(budgets)) {
        const spent = expenses[category] || 0;
        const percentage = (spent / budget) * 100;
        const isOver = spent > budget;
        
        html += `
            <div class="category-item" style="flex-direction: column; align-items: flex-start;">
                <div style="display: flex; justify-content: space-between; width: 100%;">
                    <strong>${category}</strong>
                    <span class="${isOver ? 'text-danger' : ''}">
                        R$ ${spent.toFixed(2)} / R$ ${budget.toFixed(2)}
                    </span>
                </div>
                <div style="width: 100%; background: #e5e7eb; border-radius: 10px; margin-top: 0.5rem; overflow: hidden;">
                    <div style="width: ${Math.min(percentage, 100)}%; background: ${percentage > 80 ? '#ef4444' : '#10b981'}; height: 8px;"></div>
                </div>
                ${isOver ? '<span style="color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;">⚠️ Over budget!</span>' : ''}
            </div>
        `;
    }
    html += '</div>';
    
    container.innerHTML = html;
}

// Update the existing displaySummary function
const originalDisplaySummary = displaySummary;
displaySummary = function(summary) {
    originalDisplaySummary(summary);
    window.currentSummary = summary;
    displayBudgetStatus();
};