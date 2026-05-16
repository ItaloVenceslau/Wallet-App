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

  // Add month/year selector to dashboard
  const metricsSection = document.querySelector('.metrics-grid');
  if (metricsSection && !document.getElementById('month-year-selector')) {
    const selectorDiv = document.createElement('div');
    selectorDiv.id = 'month-year-selector';
    selectorDiv.style.cssText = 'display: flex; gap: 12px; align-items: center; margin-bottom: 24px; background: var(--bg-card-white); padding: 16px 20px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);';
    selectorDiv.innerHTML = `
      <label style="font-weight: 600;">📅 Select Period:</label>
      <select id="summary-month" style="padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface);">
        ${Array.from({length: 12}, (_, i) => `<option value="${i+1}" ${i+1 === currentMonth ? 'selected' : ''}>${new Date(0, i).toLocaleString('default', { month: 'long' })}</option>`).join('')}
      </select>
      <select id="summary-year" style="padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface);">
        ${Array.from({length: 5}, (_, i) => `<option value="${currentYear - 2 + i}" ${currentYear - 2 + i === currentYear ? 'selected' : ''}>${currentYear - 2 + i}</option>`).join('')}
      </select>
      <button id="refresh-summary" class="btn-action" style="padding: 8px 16px;">🔄 Update</button>
    `;
    metricsSection.parentNode.insertBefore(selectorDiv, metricsSection);
  }

  async function loadDashboardData(month = currentMonth, year = currentYear) {
    try {
      const summary = await API.get(`/transactions/summary/monthly?month=${month}&year=${year}`);
      
      // Update metric cards
      document.getElementById('total-income').innerHTML = `💰 ${UI.formatCurrency(summary.totalIncome || 0)}`;
      document.getElementById('total-expenses').innerHTML = `💸 ${UI.formatCurrency(summary.totalExpenses || 0)}`;
      document.getElementById('total-balance').innerHTML = `⚖️ ${UI.formatCurrency(summary.balance || 0)}`;
      document.getElementById('total-count').innerHTML = `📊 ${summary.totalTransactions || 0}`;

      // Update Quick Metrics using ALL summaryService data
      document.getElementById('summary-count').innerHTML = `${summary.totalTransactions || 0} 📋`;
      
      // Calculate average transaction value
      const avgTransaction = summary.totalTransactions > 0 ? summary.totalIncome / summary.totalTransactions : 0;
      document.getElementById('summary-avg').innerHTML = `${UI.formatCurrency(avgTransaction)} 📈`;
      
      // Add more quick metrics from summaryService
      const avgExpense = summary.totalTransactions > 0 ? summary.totalExpenses / summary.totalTransactions : 0;
      const savingsRate = summary.totalIncome > 0 ? ((summary.balance / summary.totalIncome) * 100).toFixed(1) : 0;
      
      // Add additional metrics if they don't exist
      let quickMetricsDiv = document.querySelector('.quick-metrics-extended');
      if (!quickMetricsDiv) {
        const metricsContainer = document.querySelector('#summary-avg').parentElement.parentElement;
        const extendedDiv = document.createElement('div');
        extendedDiv.className = 'quick-metrics-extended';
        extendedDiv.style.marginTop = '16px';
        extendedDiv.innerHTML = `
          <div class="info-row"><span class="info-label">📊 Average Expense</span><span id="summary-avg-expense" class="info-value">—</span></div>
          <div class="info-row"><span class="info-label">💾 Savings Rate</span><span id="savings-rate" class="info-value text-success">—</span></div>
          <div class="info-row"><span class="info-label">📈 Income/Expense Ratio</span><span id="income-expense-ratio" class="info-value">—</span></div>
        `;
        metricsContainer.appendChild(extendedDiv);
      }
      
      document.getElementById('summary-avg-expense').innerHTML = UI.formatCurrency(avgExpense);
      document.getElementById('savings-rate').innerHTML = `${savingsRate}% 💪`;
      const ratio = summary.totalExpenses > 0 ? (summary.totalIncome / summary.totalExpenses).toFixed(2) : '∞';
      document.getElementById('income-expense-ratio').innerHTML = `${ratio}x ⚡`;

      // Display Expenses by Category with nice styling
      const categoriesContainer = document.getElementById('categories-list');
      if (categoriesContainer) {
        const expensesByCategory = summary.expensesByCategory || {};
        const categories = Object.entries(expensesByCategory);
        
        if (categories.length === 0) {
          categoriesContainer.innerHTML = `
            <div class="empty-state-text" style="text-align: center; padding: 40px;">
              🎉 No expenses recorded for this period! <br>
              <span style="font-size: 13px;">Keep up the great saving habit! 💪</span>
            </div>
          `;
        } else {
          // Sort by amount descending
          categories.sort((a, b) => b[1] - a[1]);
          const totalExpensesAmount = summary.totalExpenses;
          
          categoriesContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${categories.map(([category, amount]) => {
                const percentage = totalExpensesAmount > 0 ? ((amount / totalExpensesAmount) * 100).toFixed(1) : 0;
                return `
                  <div class="category-item" style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                      <span style="font-weight: 600;">🏷️ ${category}</span>
                      <span style="font-weight: 700; color: var(--text-danger);">${UI.formatCurrency(amount)}</span>
                    </div>
                    <div style="background: var(--bg-input); border-radius: 8px; overflow: hidden;">
                      <div style="background: linear-gradient(90deg, var(--grad-expense)); width: ${percentage}%; height: 8px; border-radius: 8px; transition: width 0.3s ease;"></div>
                    </div>
                    <div style="display: flex; justify-content: flex-end; margin-top: 4px;">
                      <span style="font-size: 12px; color: var(--text-muted);">${percentage}% of total expenses</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }
      }
      
    } catch (error) {
      UI.showToast(error.message, 'error');
      console.error('Dashboard loading error:', error);
    }
  }

  // Initial load
  await loadDashboardData(currentMonth, currentYear);
  
  // Setup refresh button
  const refreshBtn = document.getElementById('refresh-summary');
  const monthSelect = document.getElementById('summary-month');
  const yearSelect = document.getElementById('summary-year');
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      const month = parseInt(monthSelect.value);
      const year = parseInt(yearSelect.value);
      await loadDashboardData(month, year);
      UI.showToast(`📊 Updated summary for ${monthSelect.options[monthSelect.selectedIndex].text} ${year}`, 'success');
    });
  }
});