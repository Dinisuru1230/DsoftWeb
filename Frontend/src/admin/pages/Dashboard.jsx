import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

const STATUS_COLORS = {
  BANK_SLIP_PENDING: 'bg-tertiary-container text-on-background font-bold',
  PENDING: 'bg-surface-container text-on-surface-variant',
  PROCESSING: 'bg-secondary-container text-secondary',
  CONFIRMED: 'bg-primary-container text-primary font-bold',
  SHIPPED: 'bg-primary-container/70 text-primary font-bold',
  DELIVERED: 'bg-primary-container/40 text-on-surface-variant',
  CANCELLED: 'bg-error-container text-error',
};

const STATUS_LABELS = {
  BANK_SLIP_PENDING: 'Bank Slip Pending',
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function Dashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockCount: 0,
    totalProducts: 0,
    totalCustomers: 0,
    unreadMessages: 0,
    lowStockProducts: [],
    recentOrders: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  async function fetchDashboardStats() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/orders/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      } else {
        toast.error(data.error || 'Failed to load dashboard statistics');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading dashboard statistics');
    } finally {
      setLoading(false);
    }
  }

  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full space-y-6 md:space-y-8 max-w-[1600px] mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <span className="font-label-sm text-[11px] sm:text-xs text-primary font-bold uppercase tracking-wider">
            {currentDate}
          </span>
          <h1 className="font-headline-md text-xl sm:text-2xl md:text-headline-md text-on-background mt-0.5 font-bold">
            Admin Dashboard
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
            Welcome back{user?.name ? `, ${user.name}` : ''}! Live performance overview.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-start sm:justify-end">
          <button
            onClick={fetchDashboardStats}
            disabled={loading}
            className="flex-1 sm:flex-initial p-2 sm:p-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-1.5 font-label-md text-xs cursor-pointer shadow-xs font-semibold"
            title="Refresh dashboard metrics"
          >
            <span className={`material-symbols-outlined text-[16px] sm:text-[18px] ${loading ? 'animate-spin text-primary' : ''}`}>
              sync
            </span>
            Refresh
          </button>
          <Link
            to="/admin/add-product"
            className="flex-1 sm:flex-initial bg-primary text-white font-label-md text-xs sm:text-sm py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-1.5 shadow-ambient font-bold whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">add</span>
            Add Product
          </Link>
        </div>
      </div>

      {/* Metrics Grid: 2 columns on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Total Orders */}
        <div className="bg-surface-container-lowest rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs sm:shadow-ambient border border-outline-variant/30 hover:border-primary/40 transition-all">
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-lg sm:text-2xl">shopping_bag</span>
            </div>
            <Link
              to="/admin/orders"
              className="text-[11px] sm:text-xs text-primary font-bold hover:underline flex items-center gap-0.5"
            >
              View <span className="material-symbols-outlined text-[12px] sm:text-[14px]">arrow_forward</span>
            </Link>
          </div>
          <p className="font-headline-md text-lg sm:text-2xl md:text-3xl text-on-surface font-bold leading-tight">
            {loading ? '—' : Number(stats.totalOrders || 0).toLocaleString()}
          </p>
          <p className="font-label-md text-[10px] sm:text-xs text-on-surface-variant mt-0.5">Total Store Orders</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-surface-container-lowest rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs sm:shadow-ambient border border-outline-variant/30 hover:border-secondary/40 transition-all">
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-secondary-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg sm:text-2xl">payments</span>
            </div>
            <span className="font-label-sm text-[9px] sm:text-[11px] px-1.5 py-0.5 rounded-full bg-secondary-container/50 text-secondary font-bold">
              Rs. LKR
            </span>
          </div>
          <p className="font-headline-md text-base sm:text-xl md:text-3xl text-on-surface font-bold leading-tight truncate">
            {loading ? '—' : `Rs. ${Number(stats.totalRevenue || 0).toLocaleString()}`}
          </p>
          <p className="font-label-md text-[10px] sm:text-xs text-on-surface-variant mt-0.5">Gross Revenue</p>
        </div>

        {/* Pending Orders & Bank Slips */}
        <div className="bg-surface-container-lowest rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs sm:shadow-ambient border border-outline-variant/30 hover:border-tertiary/40 transition-all">
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-tertiary-container flex items-center justify-center text-on-background">
              <span className="material-symbols-outlined text-lg sm:text-2xl">hourglass_top</span>
            </div>
            <Link
              to="/admin/orders"
              className="text-[11px] sm:text-xs text-tertiary font-bold hover:underline flex items-center gap-0.5"
            >
              Verify <span className="material-symbols-outlined text-[12px] sm:text-[14px]">arrow_forward</span>
            </Link>
          </div>
          <p className="font-headline-md text-lg sm:text-2xl md:text-3xl text-on-surface font-bold leading-tight">
            {loading ? '—' : stats.pendingOrders}
          </p>
          <p className="font-label-md text-[10px] sm:text-xs text-on-surface-variant mt-0.5 truncate">Pending / Slips</p>
        </div>

        {/* Catalog & Inventory Health */}
        <div className="bg-surface-container-lowest rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs sm:shadow-ambient border border-outline-variant/30 hover:border-primary/40 transition-all">
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-lg sm:text-2xl">inventory_2</span>
            </div>
            {stats.lowStockCount > 0 ? (
              <span className="font-label-sm text-[9px] sm:text-[11px] px-1.5 py-0.5 rounded-full bg-error-container text-error font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[10px] sm:text-[12px]">warning</span>
                {stats.lowStockCount} Low
              </span>
            ) : (
              <span className="font-label-sm text-[9px] sm:text-[11px] px-1.5 py-0.5 rounded-full bg-secondary-container text-secondary font-bold">
                Healthy
              </span>
            )}
          </div>
          <p className="font-headline-md text-lg sm:text-2xl md:text-3xl text-on-surface font-bold leading-tight">
            {loading ? '—' : `${stats.totalProducts} Items`}
          </p>
          <p className="font-label-md text-[10px] sm:text-xs text-on-surface-variant mt-0.5 truncate">
            {stats.totalCustomers} Customers
          </p>
        </div>
      </div>

      {/* Main Content Layout: 2 Columns on Desktop, 1 Column on Mobile/Tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Recent Orders (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-surface-container-lowest rounded-xl sm:rounded-2xl shadow-xs sm:shadow-ambient border border-outline-variant/30 overflow-hidden">
            <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 sm:py-4 border-b border-outline-variant/30 bg-surface-container-low/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl sm:text-2xl">receipt_long</span>
                <div>
                  <h2 className="font-title-sm text-sm sm:text-title-sm text-on-surface font-bold">Recent Real Orders</h2>
                  <p className="font-body-md text-[11px] sm:text-xs text-on-surface-variant hidden sm:block">Latest purchases placed by boutique customers</p>
                </div>
              </div>
              <Link
                to="/admin/orders"
                className="font-label-md text-xs text-primary font-bold hover:underline flex items-center gap-0.5"
              >
                View All
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>

            {loading ? (
              <div className="py-12 sm:py-16 text-center text-on-surface-variant space-y-3">
                <span className="material-symbols-outlined animate-spin text-2xl sm:text-3xl text-primary">sync</span>
                <p className="font-body-md text-xs sm:text-sm">Fetching real order transactions...</p>
              </div>
            ) : !stats.recentOrders || stats.recentOrders.length === 0 ? (
              <div className="p-8 sm:p-12 text-center text-on-surface-variant space-y-2 sm:space-y-3">
                <span className="material-symbols-outlined text-4xl sm:text-5xl text-outline">shopping_bag</span>
                <p className="font-body-md text-xs sm:text-sm font-semibold">No orders recorded in the system yet.</p>
                <p className="font-label-sm text-[11px] sm:text-xs">Customer purchases will automatically appear here in real time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[560px]">
                  <thead>
                    <tr className="border-b border-outline-variant/30 bg-surface-container-low/20 text-[11px] sm:text-xs font-label-md text-on-surface-variant">
                      <th className="py-2.5 sm:py-3 px-3 sm:px-4">Order ID</th>
                      <th className="py-2.5 sm:py-3 px-3 sm:px-4">Customer</th>
                      <th className="py-2.5 sm:py-3 px-3 sm:px-4">Items</th>
                      <th className="py-2.5 sm:py-3 px-3 sm:px-4">Date</th>
                      <th className="py-2.5 sm:py-3 px-3 sm:px-4">Status</th>
                      <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 font-body-md text-xs text-on-surface">
                    {stats.recentOrders.map((order) => {
                      const formattedDate = order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : 'Recent';

                      const firstItem = order.items?.[0];

                      return (
                        <tr
                          key={order.id}
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="hover:bg-surface-container-low/70 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-3 sm:px-4 font-bold text-primary group-hover:underline whitespace-nowrap">
                            {order.orderNumber}
                          </td>
                          <td className="py-3 px-3 sm:px-4">
                            <span className="font-semibold text-on-surface block leading-tight">{order.customerName}</span>
                            <span className="text-[10px] text-on-surface-variant">{order.phone}</span>
                          </td>
                          <td className="py-3 px-3 sm:px-4">
                            <div className="flex items-center gap-2">
                              {firstItem?.product?.image && (
                                <img
                                  src={firstItem.product.image}
                                  alt="Item"
                                  className="w-6 h-6 sm:w-7 sm:h-7 rounded object-cover border border-outline-variant/30 flex-shrink-0"
                                />
                              )}
                              <span className="truncate max-w-[110px] sm:max-w-[140px] text-[11px] sm:text-xs">
                                {firstItem?.product?.name || 'Handcrafted Item'}
                                {order.items?.length > 1 ? ` +${order.items.length - 1}` : ''}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-on-surface-variant text-[11px] sm:text-xs whitespace-nowrap">
                            {formattedDate}
                          </td>
                          <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${
                                STATUS_COLORS[order.orderStatus] || 'bg-surface-container text-on-surface-variant'
                              }`}
                            >
                              {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-right font-bold text-on-surface text-[11px] sm:text-xs whitespace-nowrap">
                            Rs. {Number(order.totalAmount || 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Inventory Restock & Support (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          {/* Low Stock Inventory Alert */}
          <div className="bg-surface-container-lowest rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs sm:shadow-ambient border border-outline-variant/30 space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2.5 sm:pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-lg sm:text-xl">inventory</span>
                <h3 className="font-title-sm text-xs sm:text-sm text-on-surface font-bold">Low Stock Watchlist</h3>
              </div>
              <Link to="/admin/products" className="text-xs text-primary font-bold hover:underline">
                Manage
              </Link>
            </div>

            {loading ? (
              <div className="py-4 text-center text-xs text-on-surface-variant">Checking inventory...</div>
            ) : !stats.lowStockProducts || stats.lowStockProducts.length === 0 ? (
              <div className="p-3 sm:p-4 bg-secondary-container/20 border border-secondary/20 rounded-xl flex items-center gap-2.5 text-secondary text-xs">
                <span className="material-symbols-outlined text-base sm:text-lg">check_circle</span>
                <span>All catalog products have adequate stock levels!</span>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/20">
                {stats.lowStockProducts.map((p) => (
                  <div key={p.id} className="py-2.5 sm:py-3 flex items-center justify-between gap-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={p.image || '/14_blush_silk_ribbon_bow.jpg'}
                        alt={p.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover border border-outline-variant/30 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-title-sm text-xs text-on-surface font-bold truncate">{p.name}</p>
                        <p className="text-[10px] text-on-surface-variant">{p.categoryName || 'General'}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${p.stock === 0 ? 'bg-error-container text-error' : 'bg-tertiary-container text-tertiary'}`}>
                        {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                      </span>
                      <Link
                        to={`/admin/edit-product/${p.id}`}
                        className="block text-[10px] sm:text-[11px] text-primary hover:underline mt-0.5 font-semibold"
                      >
                        Restock
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Management Shortcuts */}
          <div className="bg-surface-container-lowest rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs sm:shadow-ambient border border-outline-variant/30 space-y-3 sm:space-y-4">
            <h3 className="font-title-sm text-xs sm:text-sm text-primary font-bold uppercase tracking-wider">
              Quick Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 font-label-md text-xs">
              <Link
                to="/admin/orders"
                className="p-2.5 sm:p-3 bg-surface-container-low hover:bg-primary-container/40 rounded-xl border border-outline-variant/20 flex flex-col items-center justify-center text-center gap-1 transition-colors group"
              >
                <span className="material-symbols-outlined text-primary text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                  local_shipping
                </span>
                <span className="font-bold text-on-surface text-[11px] sm:text-xs">Manage Orders</span>
              </Link>

              <Link
                to="/admin/products"
                className="p-2.5 sm:p-3 bg-surface-container-low hover:bg-primary-container/40 rounded-xl border border-outline-variant/20 flex flex-col items-center justify-center text-center gap-1 transition-colors group"
              >
                <span className="material-symbols-outlined text-primary text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                  inventory_2
                </span>
                <span className="font-bold text-on-surface text-[11px] sm:text-xs">All Products</span>
              </Link>

              <Link
                to="/admin/bank-details"
                className="p-2.5 sm:p-3 bg-surface-container-low hover:bg-primary-container/40 rounded-xl border border-outline-variant/20 flex flex-col items-center justify-center text-center gap-1 transition-colors group"
              >
                <span className="material-symbols-outlined text-primary text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                  account_balance
                </span>
                <span className="font-bold text-on-surface text-[11px] sm:text-xs">Bank Details</span>
              </Link>

              <Link
                to="/admin/delivery-settings"
                className="p-2.5 sm:p-3 bg-surface-container-low hover:bg-primary-container/40 rounded-xl border border-outline-variant/20 flex flex-col items-center justify-center text-center gap-1 transition-colors group"
              >
                <span className="material-symbols-outlined text-primary text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                  settings
                </span>
                <span className="font-bold text-on-surface text-[11px] sm:text-xs">Delivery Rates</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
