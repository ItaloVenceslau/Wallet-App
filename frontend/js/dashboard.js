import { Auth } from './auth.js';
import { API } from './api.js';
import { UI } from './ui.js';
import { Sidebar } from './sidebar.js';

document.addEventListener('DOMContentLoaded', async () => {
  Auth.checkGuard();
  Sidebar.render('dashboard');

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; 
  const currentYear = currentDate.getFullYear();

  try {
    // Calls your exact monthly summary backend endpoint
    const summary = await API.get(`/transactions/summary/monthly?month=${currentMonth}&year=${currentYear}`);
    
    document.getElementById('total-income').innerText = UI.formatCurrency(summary.totalIncome || 0);
    document.getElementById('total-expenses').innerText = UI.formatCurrency(summary.totalExpenses || 0);
    document.getElementById('total-balance').innerText = UI.formatCurrency(summary.balance || 0);
    document.getElementById('total-count').innerText = summary.totalTransactions || 0;

    document.getElementById('summary-count').innerText = summary.totalTransactions || 0;
    document.getElementById('summary-avg').innerText = UI.formatCurrency(
      summary.totalTransactions > 0 ? (summary.totalIncome / summary.totalTransactions) : 0
    );

    const categoriesContainer = document.getElementById('categories-list');
    if (categoriesContainer && summary.expensesByCategory) {
      const categories = Object.entries(summary.expensesByCategory);
      if (categories.length === 0) {
        categoriesContainer.innerHTML = '<p class="empty-state-text">No categorized expenses for this month.</p>';
      } else {
        categoriesContainer.innerHTML = categories.map(([category, amount]) => `
          <div class="info-row">
            <span class="info-label">${category}</span>
            <span class="info-value text-danger">${UI.formatCurrency(amount)}</span>
          </div>
        `).join('');
      }
    }

  } catch (error) {
    UI.showToast(error.message, 'error');
  }
});
