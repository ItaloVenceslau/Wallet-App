import { Auth } from './auth.js';

export const Sidebar = {
  render(activePage) {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;

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

        <!-- User Profile Avatar Image Section -->
        <div class="sidebar-user-profile" style="display: flex; align-items: center; gap: 12px; padding: 16px 8px; margin-top: auto; border-top: 1px solid rgba(255,255,255,0.08); margin-bottom: 8px;">
          <img src="https://dicebear.com" alt="Avatar Graphic" style="width: 36px; height: 36px; border-radius: 50%; background: var(--grad-accent); padding: 2px;">
          <div class="user-info-text" style="display: flex; flex-direction: column;">
            <span style="font-size: 13px; font-weight: 600; color: #ffffff;">Active User</span>
            <span style="font-size: 11px; color: #94a3b8;">Verified Node</span>
          </div>
        </div>

        <button id="btn-logout-sidebar" class="btn-logout">
          <i data-lucide="log-out" style="width: 18px; height: 18px;"></i>
          <span>Sign Out</span>
        </button>
      </aside>
    `;

    document.getElementById('btn-logout-sidebar').addEventListener('click', () => {
      Auth.logout();
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
};
