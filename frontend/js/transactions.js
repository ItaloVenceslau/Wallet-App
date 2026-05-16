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

  if(btnOpenModal) btnOpenModal.addEventListener('click', () => UI.openModal('transaction-modal'));
  if(btnCloseModal) btnCloseModal.addEventListener('click', () => UI.closeModal('transaction-modal'));
  if(btnCancelModal) btnCancelModal.addEventListener('click', () => UI.closeModal('transaction-modal'));

  if (transactionForm) {
    transactionForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        title: document.getElementById('t-title').value,
        amount: parseFloat(document.getElementById('t-amount').value),
        type: document.getElementById('t-type').value,
        category: document.getElementById('t-category').value,
        date: document.getElementById('t-date').value,
        note: document.getElementById('t-note').value
      };

      try {
        await API.post('/transactions', payload);
        UI.showToast('Transaction saved successfully!', 'success');
        UI.closeModal('transaction-modal');
        transactionForm.reset();
        loadTransactions();
      } catch (error) {
        UI.showToast(error.message, 'error');
      }
    });
  }

  async function loadTransactions() {
    const tableBody = document.getElementById('transactions-table-body');
    if (!tableBody) return;

    try {
      const data = await API.get('/transactions');
      const list = data.transactions || [];

      if (list.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">
              No records found. Click the button above to add a new transaction log!
            </td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = list.map(item => `
        <tr>
          <td><strong>${item.title}</strong></td>
          <td><span class="badge ${item.type === 'income' ? 'income' : 'expense'}">${item.type === 'income' ? 'Income' : 'Expense'}</span></td>
          <td class="${item.type === 'income' ? 'text-success' : 'text-danger'}" style="font-weight: 600;">
            ${item.type === 'income' ? '+' : '-'} ${UI.formatCurrency(item.amount)}
          </td>
          <td>${item.category}</td>
          <td>${UI.formatDate(item.date)}</td>
          <td>
            <button class="btn-delete-trans" data-id="${item._id}" style="background:transparent; border:none; cursor:pointer; color:var(--text-muted);">
              <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
            </button>
          </td>
        </tr>
      `).join('');

      document.querySelectorAll('.btn-delete-trans').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          if (confirm('Are you sure you want to delete this transaction record?')) {
            try {
              await API.delete(`/transactions/${id}`);
              UI.showToast('Transaction record deleted.');
              loadTransactions();
            } catch (err) {
              UI.showToast(err.message, 'error');
            }
          }
        });
      });

      if (window.lucide) window.lucide.createIcons();

    } catch (error) {
      UI.showToast(error.message, 'error');
    }
  }

  loadTransactions();
});
