import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccountSidebar from '../components/AccountSidebar';
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

export default function MyAccount() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchMyOrders();
    } else {
      setLoading(false);
    }
  }, [token]);

  async function fetchMyOrders() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
      } else {
        toast.error(data.error || 'Failed to load order history');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading order history');
    } finally {
      setLoading(false);
    }
  }

  function handleTrack(orderNumber) {
    navigate(`/track-order?id=${orderNumber}`);
  }

  return (
    <main className="flex-grow flex flex-col md:flex-row w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 py-12 gap-8">
      {/* Unified Account Sidebar */}
      <AccountSidebar />

      {/* Main Content Area */}
      <section className="flex-grow">
        <div className="mb-6">
          <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary mb-1">
            Order History
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Review your past purchases and track real-time delivery status.
          </p>
        </div>

        {/* Bento Card & Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-6 md:p-8 overflow-hidden border border-outline-variant/30 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-on-surface-variant space-y-3">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">sync</span>
              <p className="font-body-md">Loading your order history...</p>
            </div>
          ) : !token ? (
            <div className="text-center py-12 space-y-4">
              <span className="material-symbols-outlined text-4xl text-outline">lock</span>
              <h3 className="font-title-sm text-primary">Sign in to view your orders</h3>
              <p className="font-body-md text-on-surface-variant text-sm max-w-sm mx-auto">
                Log into your customer account to see all your past boutique purchases and tracking records.
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-2.5 bg-primary text-white font-label-md rounded-full hover:bg-primary/90 transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <span className="material-symbols-outlined text-5xl text-outline">shopping_bag</span>
              <h3 className="font-title-sm text-on-surface">You haven't placed any orders yet</h3>
              <p className="font-body-md text-on-surface-variant text-sm max-w-md mx-auto">
                Explore our handcrafted floral ribbons, bows, and artisan headbands to find your next favorite piece.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-label-md rounded-full hover:bg-primary/90 transition-colors shadow-ambient"
              >
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b-2 border-primary/20 bg-surface-container-low/40">
                    <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Order Number</th>
                    <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Date</th>
                    <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Items</th>
                    <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Total Amount</th>
                    <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Status</th>
                    <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {orders.map((order) => {
                    const formattedDate = order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Recent';

                    const itemCount = (order.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);

                    return (
                      <tr
                        key={order.id}
                        onClick={() => handleTrack(order.orderNumber)}
                        className="group hover:bg-surface-container-low/70 transition-colors duration-200 cursor-pointer"
                      >
                        <td className="py-4 px-4">
                          <span className="font-body-md text-primary font-bold group-hover:underline">
                            {order.orderNumber}
                          </span>
                          <p className="font-label-sm text-xs text-on-surface-variant capitalize">
                            {order.paymentMethod === 'BANK_TRANSFER'
                              ? 'Bank Transfer'
                              : order.paymentMethod === 'CARD'
                              ? 'Card Payment'
                              : 'COD'}
                          </p>
                        </td>
                        <td className="py-4 px-4 font-body-md text-body-md text-on-surface-variant">
                          {formattedDate}
                        </td>
                        <td className="py-4 px-4 font-body-md text-body-md text-on-surface">
                          <div className="flex items-center gap-2">
                            {order.items?.[0]?.product?.image && (
                              <img
                                src={order.items[0].product.image}
                                alt="Item"
                                className="w-8 h-8 rounded object-cover border border-outline-variant/30 flex-shrink-0"
                              />
                            )}
                            <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-body-md text-body-md text-on-surface font-bold">
                          Rs. {Number(order.totalAmount || 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full font-label-sm text-xs ${STATUS_COLORS[order.orderStatus] || 'bg-surface-container text-on-surface-variant'}`}>
                            {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleTrack(order.orderNumber)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-container text-on-background font-label-md text-xs rounded-lg hover:bg-primary hover:text-white transition-all cursor-pointer font-bold shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                            Track Order
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Support Note Box */}
          <div className="p-6 bg-surface-container-low rounded-xl border border-primary-fixed-dim/30 flex items-start gap-4">
            <span className="material-symbols-outlined text-primary text-2xl mt-0.5">favorite</span>
            <div className="space-y-1">
              <h4 className="font-title-sm text-title-sm text-primary">Need help with an order?</h4>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                Our customer care team is here to assist you with any questions regarding your handcrafted pieces.
              </p>
              <Link
                to="/contact"
                className="inline-block mt-2 text-primary border-b border-primary font-label-md text-label-md pb-0.5 hover:opacity-80 transition-opacity"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
