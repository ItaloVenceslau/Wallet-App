import { Auth } from './auth.js';
import { API } from './api.js';
import { UI } from './ui.js';
import { Sidebar } from './sidebar.js';

document.addEventListener('DOMContentLoaded', () => {
  Auth.checkGuard();
  Sidebar.render('transactions');

  const btnOpenModal = document.getElementById('btn-open-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const transactionForm = document.getElementById('transaction-form');
  const modalTitle = document.getElementById('modal-form-title');

  // Add period filter to transactions page
  const pageHeader = document.querySelector('.page-header');
  if (pageHeader && !document.getElementById('transactions-period-filter')) {
    const filterDiv = document.createElement('div');
    filterDiv.id = 'transactions-period-filter';
    filterDiv.style.cssText = 'margin-bottom: 24px; background: var(--bg-card-white); border-radius: var(--radius-md); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;';
    filterDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-weight: 700;">📅 Filter:</span>
        <select id="filter-type" style="padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border);">
          <option value="all">🌍 All Time</option>
          <option value="income">💰 Income Only</option>
          <option value="expense">💸 Expense Only</option>
        </select>
        <select id="filter-category" style="padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border);">
          <option value="all">🏷️ All Categories</option>
        </select>
      </div>
      <div style="font-size: 13px; color: var(--text-muted);" id="transaction-count">📊 0 transactions</div>
    `;
    pageHeader.parentNode.insertBefore(filterDiv, pageHeader.nextSibling);
  }

  // Open modal config for CREATE operation
  if(btnOpenModal) {
    btnOpenModal.addEventListener('click', () => {
      transactionForm.reset();
      document.getElementById('t-id').value = ""; 
      if(modalTitle) modalTitle.innerText = "✨ New Transaction";
      UI.openModal('transaction-modal');
    });
  }

  if(btnCloseModal) btnCloseModal.addEventListener('click', () => UI.closeModal('transaction-modal'));
  if(btnCancelModal) btnCancelModal.addEventListener('click', () => UI.closeModal('transaction-modal'));

  // Form Submit interceptor (Handles POST and PUT)
  if (transactionForm) {
    transactionForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('t-id').value;
      const payload = {
        title: document.getElementById('t-title').value,
        amount: parseFloat(document.getElementById('t-amount').value),
        type: document.getElementById('t-type').value,
        category: document.getElementById('t-category').value,
        date: document.getElementById('t-date').value,
        note: document.getElementById('t-note').value
      };

      try {
        if (id) {
          await API.put(`/transactions/${id}`, payload);
          UI.showToast('✏️ Transaction updated successfully!', 'success');
        } else {
          await API.post('/transactions', payload);
          UI.showToast('✅ Transaction saved successfully!', 'success');
        }
        
        UI.closeModal('transaction-modal');
        transactionForm.reset();
        loadTransactions();
      } catch (error) {
        UI.showToast(error.message, 'error');
      }
    });
  }

  // Populate category filter
  async function populateCategoryFilter(transactions) {
    const categoryFilter = document.getElementById('filter-category');
    if (!categoryFilter) return;
    
    const categories = new Set();
    transactions.forEach(t => categories.add(t.category));
    
    categoryFilter.innerHTML = '<option value="all">🏷️ All Categories</option>' + 
      Array.from(categories).sort().map(cat => `<option value="${cat}">📌 ${cat}</option>`).join('');
  }

  // Fetch log collection and map to tabular structure
  async function loadTransactions() {
    const tableBody = document.getElementById('transactions-table-body');
    if (!tableBody) return;

    try {
      const data = await API.get('/transactions');
      let list = data.transactions || [];
      
      // Apply filters
      const filterType = document.getElementById('filter-type')?.value || 'all';
      const filterCategory = document.getElementById('filter-category')?.value || 'all';
      
      if (filterType !== 'all') {
        list = list.filter(t => t.type === filterType);
      }
      if (filterCategory !== 'all') {
        list = list.filter(t => t.category === filterCategory);
      }
      
      // Update transaction count
      const countSpan = document.getElementById('transaction-count');
      if (countSpan) countSpan.innerHTML = `📊 ${list.length} transaction${list.length !== 1 ? 's' : ''}`;
      
      // Populate category filter with all transactions (not filtered)
      await populateCategoryFilter(data.transactions || []);

      if (list.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 48px;">
              📭 No records found. Click the button above to add a new transaction log!
            </td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = list.map(item => {
        const cleanDate = item.date ? item.date.split('T')[0] : '';
        
        return `
          <tr>
            <td><strong>${item.title}</strong></td>
            <td><span class="badge ${item.type === 'income' ? 'income' : 'expense'}">${item.type === 'income' ? '💰 Income' : '💸 Expense'}</span></td>
            <td class="${item.type === 'income' ? 'text-success' : 'text-danger'}" style="font-weight: 600;">
              ${item.type === 'income' ? '+' : '-'} ${UI.formatCurrency(item.amount)}
            </td>
            <td>${item.category}</td>
            <td>${UI.formatDate(item.date)}</td>
            <td>
              <div style="display: flex; gap: 12px;">
                <button class="btn-view-trans" 
                        data-id="${item._id}" 
                        style="background:transparent; border:none; cursor:pointer; color:var(--text-muted); font-size: 18px;" 
                        title="👁️ View Details">
                  👁️
                </button>
                <button class="btn-edit-trans" 
                        data-id="${item._id}" 
                        data-title="${item.title}"
                        data-amount="${item.amount}"
                        data-type="${item.type}"
                        data-category="${item.category}"
                        data-date="${cleanDate}"
                        data-note="${item.note || ''}"
                        style="background:transparent; border:none; cursor:pointer; color:var(--text-muted); font-size: 18px;"
                        title="✏️ Edit">
                  ✏️
                </button>
                <button class="btn-delete-trans" data-id="${item._id}" style="background:transparent; border:none; cursor:pointer; color:var(--text-muted); font-size: 18px;" title="🗑️ Delete">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join("");

      // Setup Listeners for View Button (getTransactionById)
      document.querySelectorAll('.btn-view-trans').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = btn.getAttribute('data-id');
          try {
            const transaction = await API.get(`/transactions/${id}`);
            if (transaction && transaction.transaction) {
              const t = transaction.transaction;
              const viewModal = document.getElementById('view-transaction-modal');
              if (viewModal) {
                document.getElementById('view-title').innerText = t.title || '—';
                document.getElementById('view-amount').innerHTML = `${t.type === 'income' ? '💰' : '💸'} ${UI.formatCurrency(t.amount)}`;
                document.getElementById('view-type').innerHTML = `<span class="badge ${t.type === 'income' ? 'income' : 'expense'}">${t.type === 'income' ? 'Income' : 'Expense'}</span>`;
                document.getElementById('view-category').innerText = t.category || '—';
                document.getElementById('view-date').innerText = UI.formatDate(t.date);
                document.getElementById('view-note').innerText = t.note || 'No additional notes';
                document.getElementById('view-created').innerText = t.createdAt ? new Date(t.createdAt).toLocaleString() : '—';
                viewModal.classList.add('active');
              } else {
                UI.showToast(JSON.stringify(t, null, 2), 'info');
              }
            }
          } catch (err) {
            UI.showToast('Failed to load transaction details', 'error');
          }
        });
      });

      // Setup Listeners for Edit Button
      document.querySelectorAll('.btn-edit-trans').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const target = e.currentTarget;
          
          document.getElementById('t-id').value = target.getAttribute('data-id');
          document.getElementById('t-title').value = target.getAttribute('data-title');
          document.getElementById('t-amount').value = target.getAttribute('data-amount');
          document.getElementById('t-type').value = target.getAttribute('data-type');
          document.getElementById('t-category').value = target.getAttribute('data-category');
          document.getElementById('t-date').value = target.getAttribute('data-date');
          document.getElementById('t-note').value = target.getAttribute('data-note');

          if(modalTitle) modalTitle.innerText = "✏️ Edit Transaction";
          UI.openModal('transaction-modal');
        });
      });

      // Setup Listeners for Delete Button
      document.querySelectorAll('.btn-delete-trans').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          if (confirm('🗑️ Are you sure you want to delete this transaction record?')) {
            try {
              await API.delete(`/transactions/${id}`);
              UI.showToast('✅ Transaction deleted successfully!', 'success');
              loadTransactions();
            } catch (err) {
              UI.showToast(err.message, 'error');
            }
          }
        });
      });

      // Setup filter listeners
      const filterTypeSelect = document.getElementById('filter-type');
      const filterCategorySelect = document.getElementById('filter-category');
      
      if (filterTypeSelect) {
        filterTypeSelect.removeEventListener('change', loadTransactions);
        filterTypeSelect.addEventListener('change', loadTransactions);
      }
      if (filterCategorySelect) {
        filterCategorySelect.removeEventListener('change', loadTransactions);
        filterCategorySelect.addEventListener('change', loadTransactions);
      }

      if (window.lucide) window.lucide.createIcons();

    } catch (error) {
      UI.showToast(error.message, 'error');
    }
  }

  loadTransactions();
});