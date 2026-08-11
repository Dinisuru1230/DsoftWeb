import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/products', label: 'Products', icon: 'inventory_2' },
  { to: '/admin/add-product', label: 'Add Product', icon: 'add_box' },
  { to: '/admin/categories', label: 'Categories', icon: 'category' },
  { to: '/admin/orders', label: 'Orders', icon: 'shopping_cart' },
  { to: '/admin/customers', label: 'Customers', icon: 'group' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();

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
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="pt-4 border-t border-outline-variant">
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">logout</span>
          Log Out
        </button>
      </div>
    </aside>
  );
}
