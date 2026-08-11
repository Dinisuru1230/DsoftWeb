import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AccountSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navItems = [
    { label: 'Profile Information', to: '/account/profile', icon: 'person' },
    { label: 'Order History', to: '/account', icon: 'history', exact: true },
    { label: 'Track Order', to: '/account/track', icon: 'local_shipping' },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-ambient space-y-4 sticky top-24">
        {/* Account Header info */}
        <div className="mb-2">
          <h2 className="font-title-sm text-title-sm text-primary">My Account</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant truncate mt-0.5">
            {user?.name || 'Amara Perera'} ({user?.email || 'amara@malmalee.lk'})
          </p>
        </div>

        {/* Links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 font-label-md text-label-md rounded-lg transition-all duration-200 ${
                  active
                    ? 'text-primary font-bold bg-primary-container shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-primary hover:translate-x-1'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 font-label-md text-label-md text-error hover:bg-error-container/30 rounded-lg transition-all duration-200 text-left mt-2 border-t border-outline-variant/30 pt-4"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Sign Out
          </button>
        </nav>
      </div>
    </aside>
  );
}
