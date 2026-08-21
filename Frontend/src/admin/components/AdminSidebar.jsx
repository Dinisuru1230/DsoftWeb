import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5050/api';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/products', label: 'Products', icon: 'inventory_2' },
  { to: '/admin/add-product', label: 'Add Product', icon: 'add_box' },
  { to: '/admin/categories', label: 'Categories', icon: 'category' },
  { to: '/admin/orders', label: 'Orders', icon: 'shopping_cart' },
  { to: '/admin/customers', label: 'Customers', icon: 'group' },
  { to: '/admin/messages', label: 'Messages', icon: 'inbox', badgeKey: 'unread' },
  { to: '/admin/delivery-settings', label: 'Delivery Settings', icon: 'local_shipping' },
  { to: '/admin/bank-details', label: 'Bank Details', icon: 'account_balance' },
  { to: '/admin/admins', label: 'Admin Team', icon: 'admin_panel_settings' },
  { to: '/admin/profile', label: 'Admin Profile', icon: 'account_circle' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/contact/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (data.unread !== undefined) setUnreadCount(data.unread); })
      .catch(() => {});

    // Poll every 60s for new messages
    const interval = setInterval(() => {
      fetch(`${API_BASE}/contact/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => { if (data.unread !== undefined) setUnreadCount(data.unread); })
        .catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [token]);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-surface-container-lowest border-r border-outline-variant shadow-sm p-6 space-y-4 flex-shrink-0 sticky top-0">
      {/* Brand */}
      <div className="mb-6">
        <h2 className="font-display-lg text-primary tracking-tight" style={{ fontSize: '28px' }}>
          Malmalee
        </h2>
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md transition-all duration-200 ${
                isActive
                  ? 'text-primary font-bold bg-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary hover:translate-x-1'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="flex-grow">{item.label}</span>
            {item.badgeKey === 'unread' && unreadCount > 0 && (
              <span className="bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="pt-4 border-t border-outline-variant">
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 bg-error-container/20 border border-error/30 text-error font-label-md text-label-md rounded-lg hover:bg-error-container/40 transition-colors flex items-center justify-center gap-2 font-bold cursor-pointer"
        >
          <span className="material-symbols-outlined">logout</span>
          Log Out
        </button>
      </div>
    </aside>
  );
}

