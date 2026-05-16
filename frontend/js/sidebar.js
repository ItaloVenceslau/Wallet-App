import { Auth } from './auth.js';

export const Sidebar = {
  render(activePage) {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;

    // Injects the menu elements completely in English
    sidebarContainer.innerHTML = `
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="sidebar-brand-icon">
            <i data-lucide="wallet" style="width: 20px; height: 20px;"></i>
          </div>
          <span>BudgetFlow</span>
        </div>

        <ul class="sidebar-menu">
          <li>
            <a href="dashboard.html" class="sidebar-link ${activePage === 'dashboard' ? 'active' : ''}">
              <i data-lucide="layout-dashboard" style="width: 18px; height: 18px;"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a href="transactions.html" class="sidebar-link ${activePage === 'transactions' ? 'active' : ''}">
              <i data-lucide="arrow-left-right" style="width: 18px; height: 18px;"></i>
              <span>Transactions</span>
            </a>
          </li>
        </ul>

        <button id="btn-logout-sidebar" class="btn-logout">
          <i data-lucide="log-out" style="width: 18px; height: 18px;"></i>
          <span>Sign Out</span>
        </button>
      </aside>
    `;

    // Attaches the sign out event listener
    document.getElementById('btn-logout-sidebar').addEventListener('click', () => {
      Auth.logout();
    });

    // Reinitializes the dynamic icons stack
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
};
