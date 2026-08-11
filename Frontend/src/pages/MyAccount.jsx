import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ORDERS = [
  { id: 'MC-2024-001', date: '2024-07-15', status: 'Delivered', total: 45.00, items: 3, statusColor: 'text-primary' },
  { id: 'MC-2024-002', date: '2024-07-28', status: 'Processing', total: 28.00, items: 2, statusColor: 'text-secondary' },
  { id: 'MC-2024-003', date: '2024-08-01', status: 'Pending', total: 12.00, items: 1, statusColor: 'text-tertiary' },
];

export default function MyAccount() {
  const [activeTab, setActiveTab] = useState('orders');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto px-5 md:px-16 py-16">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-64 flex-shrink-0">
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient mb-4 text-center">
            <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-primary text-4xl">person</span>
            </div>
            <h2 className="font-title-sm text-title-sm text-on-surface">{user?.name || 'Malmalee User'}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">{user?.email}</p>
          </div>
          <nav className="bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden">
            {[
              { id: 'orders', label: 'My Orders', icon: 'shopping_bag' },
              { id: 'wishlist', label: 'Wishlist', icon: 'favorite' },
              { id: 'profile', label: 'Profile Settings', icon: 'manage_accounts', link: '/account/profile' },
              { id: 'track', label: 'Track Order', icon: 'local_shipping', link: '/account/track' },
            ].map((item) => (
              item.link ? (
                <Link
                  key={item.id}
                  to={item.link}
                  className="flex items-center gap-3 px-4 py-3 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors border-b border-outline-variant/50 last:border-0"
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 font-label-md text-label-md transition-colors border-b border-outline-variant/50 last:border-0 ${
                    activeTab === item.id
                      ? 'bg-primary-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.label}
                </button>
              )
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 font-label-md text-label-md text-error hover:bg-error-container/30 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-grow">
          {activeTab === 'orders' && (
            <div>
              <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary mb-6">
                My Orders
              </h1>
              <div className="space-y-4">
                {ORDERS.map((order) => (
                  <div key={order.id} className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-label-md text-label-md text-on-surface-variant mb-1">Order #{order.id}</p>
                      <p className="font-title-sm text-title-sm text-on-surface">{order.date}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{order.items} item{order.items > 1 ? 's' : ''} · ${order.total.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-label-md text-label-md ${order.statusColor} bg-primary-container/30 px-3 py-1 rounded-full`}>
                        {order.status}
                      </span>
                      <Link to="/account/track" className="font-label-md text-label-md text-primary hover:underline">
                        Track
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'wishlist' && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-outline mb-4 block">favorite</span>
              <h2 className="font-headline-md-mobile text-headline-md-mobile text-primary mb-3">Your Wishlist is Empty</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">Save products you love for later.</p>
              <Link to="/shop" className="bg-primary-container text-on-background font-label-md text-label-md py-3 px-8 rounded-full hover:bg-primary hover:text-white transition-all">
                Explore Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
