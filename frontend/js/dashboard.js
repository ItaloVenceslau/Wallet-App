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
  let currentPeriod = 'all'; // 'all', 'month', 'year'

  // Add enhanced period selector to dashboard
  const metricsSection = document.querySelector('.metrics-grid');
  if (metricsSection && !document.getElementById('period-selector')) {
    const selectorDiv = document.createElement('div');
    selectorDiv.id = 'period-selector';
    selectorDiv.style.cssText = 'background: var(--bg-card-white); border-radius: var(--radius-md); padding: 20px; margin-bottom: 24px; box-shadow: var(--shadow-sm);';
    selectorDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-weight: 700; font-size: 18px;">📅 Time Period</span>
          <div style="display: flex; gap: 8px; background: var(--bg-input); padding: 4px; border-radius: 40px;">
            <button data-period="all" class="period-btn active" style="padding: 8px 20px; border: none; border-radius: 32px; cursor: pointer; font-weight: 600; transition: all 0.2s;">🌍 All Time</button>
            <button data-period="month" class="period-btn" style="padding: 8px 20px; border: none; border-radius: 32px; cursor: pointer; font-weight: 600; transition: all 0.2s;">📆 Specific Month</button>
            <button data-period="year" class="period-btn" style="padding: 8px 20px; border: none; border-radius: 32px; cursor: pointer; font-weight: 600; transition: all 0.2s;">📅 Specific Year</button>
          </div>
        </div>
        <div id="period-controls" style="display: flex; gap: 12px; align-items: center;">
          <!-- Dynamic controls will appear here -->
          <button id="refresh-summary" class="btn-action" style="padding: 10px 20px;">🔄 Apply Filter</button>
        </div>
      </div>
      <div id="period-description" style="margin-top: 12px; font-size: 13px; color: var(--text-muted);">
        📊 Showing all transactions from the beginning
      </div>
    `;
    metricsSection.parentNode.insertBefore(selectorDiv, metricsSection);
  }

  // Function to calculate date range for "All Time"
  async function getAllTimeSummary() {
    try {
      // Fetch all transactions
      const data = await API.get('/transactions');
      const allTransactions = data.transactions || [];
      
      if (allTransactions.length === 0) {
        return {
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0,
          totalTransactions: 0,
          expensesByCategory: {}
        };
      }
      
      // Calculate aggregates
      let totalIncome = 0;
      let totalExpenses = 0;
      const expensesByCategory = {};
      
      allTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
          totalIncome += transaction.amount;
        } else {
          totalExpenses += transaction.amount;
          expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + transaction.amount;
        }
      });
      
      return {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        totalTransactions: allTransactions.length,
        expensesByCategory
      };
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      throw error;
    }
  }

  // Function to update controls based on selected period
  function updatePeriodControls(period) {
    const controlsDiv = document.getElementById('period-controls');
    if (!controlsDiv) return;
    
    const descriptionDiv = document.getElementById('period-description');
    
    if (period === 'month') {
      controlsDiv.innerHTML = `
        <select id="summary-month" style="padding: 10px 16px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface); font-weight: 500;">
          ${Array.from({length: 12}, (_, i) => `<option value="${i+1}" ${i+1 === currentMonth ? 'selected' : ''}>📆 ${new Date(0, i).toLocaleString('default', { month: 'long' })}</option>`).join('')}
        </select>
        <select id="summary-year" style="padding: 10px 16px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface); font-weight: 500;">
          ${Array.from({length: 10}, (_, i) => {
            const year = currentYear - 5 + i;
            return `<option value="${year}" ${year === currentYear ? 'selected' : ''}>📅 ${year}</option>`;
          }).join('')}
        </select>
        <button id="refresh-summary" class="btn-action" style="padding: 10px 20px;">🔄 Apply Filter</button>
      `;
      if (descriptionDiv) descriptionDiv.innerHTML = '📆 Showing data for a specific month and year combination';
    } else if (period === 'year') {
      controlsDiv.innerHTML = `
        <select id="summary-year" style="padding: 10px 16px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface); font-weight: 500;">
          ${Array.from({length: 10}, (_, i) => {
            const year = currentYear - 5 + i;
            return `<option value="${year}" ${year === currentYear ? 'selected' : ''}>📅 ${year}</option>`;
          }).join('')}
        </select>
        <button id="refresh-summary" class="btn-action" style="padding: 10px 20px;">🔄 Apply Filter</button>
      `;
      if (descriptionDiv) descriptionDiv.innerHTML = '📅 Showing data for an entire year (January to December)';
    } else {
      controlsDiv.innerHTML = `
        <button id="refresh-summary" class="btn-action" style="padding: 10px 20px;">🔄 Refresh All Data</button>
      `;
      if (descriptionDiv) descriptionDiv.innerHTML = '🌍 Showing all transactions from the beginning of time — complete financial history';
    }
    
    // Re-attach event listeners
    const refreshBtn = document.getElementById('refresh-summary');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => loadDataByPeriod());
    }
  }

  async function loadDataByPeriod() {
    const activePeriodBtn = document.querySelector('.period-btn.active');
    const period = activePeriodBtn ? activePeriodBtn.getAttribute('data-period') : 'all';
    
    try {
      let summary;
      
      if (period === 'all') {
        summary = await getAllTimeSummary();
        UI.showToast('🌍 Showing all transactions (complete history)', 'success');
      } else if (period === 'month') {
        const month = parseInt(document.getElementById('summary-month')?.value || currentMonth);
        const year = parseInt(document.getElementById('summary-year')?.value || currentYear);
        summary = await API.get(`/transactions/summary/monthly?month=${month}&year=${year}`);
        UI.showToast(`📆 Showing data for ${new Date(0, month-1).toLocaleString('default', { month: 'long' })} ${year}`, 'success');
      } else if (period === 'year') {
        const year = parseInt(document.getElementById('summary-year')?.value || currentYear);
        // For year view, we need to aggregate all months
        let yearTotalIncome = 0;
        let yearTotalExpenses = 0;
        let yearTotalTransactions = 0;
        const yearExpensesByCategory = {};
        
        for (let month = 1; month <= 12; month++) {
          try {
            const monthlySummary = await API.get(`/transactions/summary/monthly?month=${month}&year=${year}`);
            yearTotalIncome += monthlySummary.totalIncome || 0;
            yearTotalExpenses += monthlySummary.totalExpenses || 0;
            yearTotalTransactions += monthlySummary.totalTransactions || 0;
            
            // Aggregate categories
            if (monthlySummary.expensesByCategory) {
              Object.entries(monthlySummary.expensesByCategory).forEach(([category, amount]) => {
                yearExpensesByCategory[category] = (yearExpensesByCategory[category] || 0) + amount;
              });
            }
          } catch (err) {
            console.warn(`Could not fetch data for month ${month}:`, err);
          }
        }
        
        summary = {
          totalIncome: yearTotalIncome,
          totalExpenses: yearTotalExpenses,
          balance: yearTotalIncome - yearTotalExpenses,
          totalTransactions: yearTotalTransactions,
          expensesByCategory: yearExpensesByCategory
        };
        UI.showToast(`📅 Showing data for the year ${year}`, 'success');
      }
      
      await renderDashboardData(summary);
      
    } catch (error) {
      UI.showToast(error.message, 'error');
      console.error('Data loading error:', error);
    }
  }

  async function renderDashboardData(summary) {
    // Update metric cards
    document.getElementById('total-income').innerHTML = `💰 ${UI.formatCurrency(summary.totalIncome || 0)}`;
    document.getElementById('total-expenses').innerHTML = `💸 ${UI.formatCurrency(summary.totalExpenses || 0)}`;
    document.getElementById('total-balance').innerHTML = `⚖️ ${UI.formatCurrency(summary.balance || 0)}`;
    document.getElementById('total-count').innerHTML = `📊 ${summary.totalTransactions || 0}`;

    // Update Quick Metrics
    document.getElementById('summary-count').innerHTML = `${summary.totalTransactions || 0} 📋`;
    
    const avgTransaction = summary.totalTransactions > 0 ? summary.totalIncome / summary.totalTransactions : 0;
    document.getElementById('summary-avg').innerHTML = `${UI.formatCurrency(avgTransaction)} 📈`;
    
    const avgExpense = summary.totalTransactions > 0 ? summary.totalExpenses / summary.totalTransactions : 0;
    const savingsRate = summary.totalIncome > 0 ? ((summary.balance / summary.totalIncome) * 100).toFixed(1) : 0;
    
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
        <div class="info-row"><span class="info-label">💰 Net Monthly Average</span><span id="net-monthly-avg" class="info-value">—</span></div>
      `;
      metricsContainer.appendChild(extendedDiv);
    }
    
    document.getElementById('summary-avg-expense').innerHTML = UI.formatCurrency(avgExpense);
    document.getElementById('savings-rate').innerHTML = `${savingsRate}% 💪`;
    const ratio = summary.totalExpenses > 0 ? (summary.totalIncome / summary.totalExpenses).toFixed(2) : '∞';
    document.getElementById('income-expense-ratio').innerHTML = `${ratio}x ⚡`;
    
    // Calculate net monthly average (if we have transactions)
    const monthsWithData = summary.totalTransactions > 0 ? Math.ceil(summary.totalTransactions / 4) : 1; // rough estimate
    const netMonthlyAvg = summary.balance / Math.max(1, monthsWithData);
    document.getElementById('net-monthly-avg').innerHTML = UI.formatCurrency(netMonthlyAvg);

    // Display Expenses by Category
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
        categories.sort((a, b) => b[1] - a[1]);
        const totalExpensesAmount = summary.totalExpenses;
        
        categoriesContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${categories.map(([category, amount]) => {
              const percentage = totalExpensesAmount > 0 ? ((amount / totalExpensesAmount) * 100).toFixed(1) : 0;
              return `
                <div class="category-item" style="margin-bottom: 8px; padding: 12px; background: var(--bg-input); border-radius: 12px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: 700; font-size: 15px;">🏷️ ${category}</span>
                    <span style="font-weight: 800; color: var(--text-danger); font-size: 16px;">${UI.formatCurrency(amount)}</span>
                  </div>
                  <div style="background: rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden;">
                    <div style="background: var(--grad-expense); width: ${percentage}%; height: 10px; border-radius: 10px; transition: width 0.4s ease;"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-top: 6px;">
                    <span style="font-size: 12px; color: var(--text-muted);">${percentage}% of total expenses</span>
                    <span style="font-size: 12px; font-weight: 600;">💰 ${UI.formatCurrency(amount)}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <div style="margin-top: 20px; padding: 12px; background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1)); border-radius: 12px; text-align: center;">
            <span style="font-size: 13px;">📊 Total Expenses: ${UI.formatCurrency(totalExpensesAmount)} across ${categories.length} categories</span>
          </div>
        `;
      }
    }
  }

  // Setup period button listeners
  function setupPeriodButtons() {
    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        periodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const period = btn.getAttribute('data-period');
        currentPeriod = period;
        updatePeriodControls(period);
        // Auto-load data when period changes
        loadDataByPeriod();
      });
    });
  }

  // Initialize with All Time period
  updatePeriodControls('all');
  setupPeriodButtons();
  
  // Initial load with All Time data
  await loadDataByPeriod();
});