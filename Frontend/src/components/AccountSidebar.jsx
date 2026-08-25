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
    { label: 'Profile Info', to: '/account/profile', icon: 'person' },
    { label: 'Order History', to: '/account', icon: 'history', exact: true },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 sm:p-6 shadow-ambient space-y-3 sm:space-y-4 md:sticky md:top-24">
        {/* Account Header info */}
        <div className="flex items-center justify-between md:block">
          <div>
            <h2 className="font-title-sm text-title-sm text-primary font-bold">My Account</h2>
            <p className="font-label-sm text-xs text-on-surface-variant truncate mt-0.5">
              {user ? `${user.name}` : 'Customer Account'}
            </p>
          </div>
          {/* Mobile Quick Logout */}
          <button
            onClick={handleLogout}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs text-error font-label-md font-bold bg-error-container/20 rounded-lg hover:bg-error-container/40 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Sign Out
          </button>
        </div>

        {/* Links: Horizontal scroll on mobile, vertical stack on desktop */}
        <nav className="flex md:flex-col gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 font-label-md text-xs sm:text-sm rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 md:flex-shrink ${
                  active
                    ? 'text-primary font-bold bg-primary-container shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          {/* Desktop Sign Out Button */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-3 px-4 py-3 font-label-md text-sm text-error hover:bg-error-container/30 rounded-lg transition-all duration-200 text-left mt-2 border-t border-outline-variant/30 pt-4 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Sign Out
          </button>
        </nav>
      </div>
    </aside>
  );
}
