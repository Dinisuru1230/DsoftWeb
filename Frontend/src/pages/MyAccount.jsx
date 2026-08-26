import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccountSidebar from '../components/AccountSidebar';
import InvoiceModal from '../components/InvoiceModal';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

const STATUS_COLORS = {
  BANK_SLIP_PENDING: 'bg-tertiary-container text-on-background font-bold',
  PENDING: 'bg-surface-container text-on-surface-variant',
  PROCESSING: 'bg-secondary-container text-secondary',
  CONFIRMED: 'bg-primary-container text-primary font-bold',
  DELIVERED: 'bg-primary-container/40 text-on-surface-variant',
  CANCELLED: 'bg-error-container text-error',
};

const STATUS_LABELS = {
  BANK_SLIP_PENDING: 'Bank Slip Pending',
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  CONFIRMED: 'Confirmed',
  DELIVERED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function MyAccount() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const recentOrder = location.state?.recentOrder;

  useEffect(() => {
    if (token) {
      fetchMyOrders();
    } else if (recentOrder) {
      setOrders([recentOrder]);
      setLoading(false);
      if (recentOrder.orderNumber) {
        fetch(`${API_BASE}/orders/track/${recentOrder.orderNumber}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((fresh) => {
            if (fresh) setOrders([fresh]);
          })
          .catch(() => {});
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  async function openOrderDetails(order) {
    setSelectedOrder(order);
    const num = order.orderNumber || order.id;
    if (num) {
      try {
        const res = await fetch(`${API_BASE}/orders/track/${num}`);
        if (res.ok) {
          const freshOrder = await res.json();
          setSelectedOrder(freshOrder);
          setOrders((prev) =>
            prev.map((o) => (o.orderNumber === freshOrder.orderNumber || o.id === freshOrder.id ? freshOrder : o))
          );
        }
      } catch (e) {
        console.error('Error fetching live order details:', e);
      }
    }
  }

  async function fetchMyOrders() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        let fetched = Array.isArray(data) ? data : [];
        if (recentOrder && !fetched.some((o) => o.orderNumber === recentOrder.orderNumber || o.id === recentOrder.id)) {
          fetched = [recentOrder, ...fetched];
        }
        setOrders(fetched);
      } else {
        if (recentOrder) setOrders([recentOrder]);
        else toast.error(data.error || 'Failed to load order history');
      }
    } catch (err) {
      console.error(err);
      if (recentOrder) setOrders([recentOrder]);
      else toast.error('Network error loading order history');
    } finally {
      setLoading(false);
    }
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
            Review your past purchases and digital license orders.
          </p>
        </div>

        {/* Bento Card & Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-6 md:p-8 overflow-hidden border border-outline-variant/30 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-on-surface-variant space-y-3">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">sync</span>
              <p className="font-body-md">Loading your order history...</p>
            </div>
          ) : (!token && orders.length === 0) ? (
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
                Explore our genuine software licenses, operating systems, and office suites.
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
                        className="hover:bg-surface-container-low/70 transition-colors duration-200"
                      >
                        <td className="py-4 px-4">
                          <span className="font-body-md text-primary font-bold">
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
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openOrderDetails(order)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white font-label-md text-xs rounded-lg transition-all duration-200 cursor-pointer font-bold border border-primary/20 shadow-xs"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              View Order
                            </button>
                            <button
                              onClick={() => setInvoiceOrder(order)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary-container text-on-primary-container hover:bg-primary hover:text-white font-label-md text-xs rounded-lg transition-all duration-200 cursor-pointer font-bold border border-primary/20 shadow-xs"
                            >
                              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                              Invoice
                            </button>
                          </div>
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
                Our customer care team is here to assist you with any questions regarding your digital product orders.
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

      {/* ── ORDER INFORMATION POPUP MODAL ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative space-y-6">

            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-outline-variant/30 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-on-background relative inline-block">
                  Order Information
                  <span className="block h-1 bg-primary rounded-full mt-1 w-20" />
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* 1. ORDER DETAILS */}
            <div className="border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden text-sm">
              <div className="bg-neutral-100 dark:bg-neutral-800 px-4 py-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider border-b border-neutral-300 dark:border-neutral-700">
                ORDER DETAILS
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-neutral-900 leading-relaxed">
                <div className="space-y-1">
                  <p><span className="font-bold text-neutral-700 dark:text-neutral-300">Invoice No.:</span> {selectedOrder.orderNumber}</p>
                  <p><span className="font-bold text-neutral-700 dark:text-neutral-300">Order ID:</span> {selectedOrder.orderNumber}</p>
                  <p><span className="font-bold text-neutral-700 dark:text-neutral-300">Date Added:</span> {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB')}</p>
                </div>
                <div className="space-y-1">
                  <p><span className="font-bold text-neutral-700 dark:text-neutral-300">Payment Method:</span> {selectedOrder.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer - Direct Deposit' : selectedOrder.paymentMethod === 'CARD' ? 'Credit / Debit Card' : 'Online Payment'}</p>
                  <p><span className="font-bold text-neutral-700 dark:text-neutral-300">Shipping Method:</span> Free Shipping (Digital Key / Email)</p>
                </div>
              </div>
            </div>

            {/* 2. PAYMENT ADDRESS & SHIPPING ADDRESS */}
            <div className="border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                <div className="px-4 py-2.5 border-b md:border-b-0 md:border-r border-neutral-300 dark:border-neutral-700">PAYMENT ADDRESS</div>
                <div className="px-4 py-2.5">SHIPPING ADDRESS</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 p-4 bg-white dark:bg-neutral-900 gap-4">
                <div className="space-y-1 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 pb-3 md:pb-0 md:pr-4">
                  <p className="font-bold text-on-background">{selectedOrder.customerName}</p>
                  <p className="text-on-surface-variant text-xs">Sri Lanka</p>
                </div>
                <div className="space-y-1 md:pl-2">
                  <p className="font-bold text-on-background">{selectedOrder.customerName}</p>
                  <p className="text-on-surface-variant text-xs">Sri Lanka</p>
                </div>
              </div>
            </div>

            {/* 3. PRODUCT NAME TABLE */}
            <div className="border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden text-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase">
                      <th className="py-2.5 px-4">PRODUCT NAME</th>
                      <th className="py-2.5 px-4 text-center">QUANTITY</th>
                      <th className="py-2.5 px-4 text-right">PRICE</th>
                      <th className="py-2.5 px-4 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="py-3.5 px-4 font-medium text-on-surface">
                          <div>{item.product?.name || 'Software Product'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold">{item.quantity}</td>
                        <td className="py-3.5 px-4 text-right">Rs. {Number(item.price || 0).toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right font-bold">Rs. {(Number(item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-neutral-100 dark:bg-neutral-800/80 border-t border-neutral-300 dark:border-neutral-700">
                    <tr>
                      <td colSpan="3" className="py-2.5 px-4 text-right font-bold text-xs uppercase text-neutral-700 dark:text-neutral-300">Sub-Total</td>
                      <td className="py-2.5 px-4 text-right font-bold">Rs. {Number(selectedOrder.totalAmount || 0).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="py-2.5 px-4 text-right font-bold text-xs uppercase text-neutral-700 dark:text-neutral-300">Total</td>
                      <td className="py-2.5 px-4 text-right font-bold text-primary text-base">Rs. {Number(selectedOrder.totalAmount || 0).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* 4. YOUR PRODUCTS (KEYS) */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                <h3 className="text-xl font-bold text-on-background relative inline-block">
                  Your Products
                  <span className="block h-1 bg-primary rounded-full mt-1 w-16" />
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const keysText = (selectedOrder.items || [])
                        .map((i) => {
                          const keys = (i.licenseKey || i.product?.licenseKey || '').split(',').map((k) => k.trim()).filter(Boolean);
                          return keys.length ? keys.join('\n') : null;
                        })
                        .filter(Boolean)
                        .join('\n');
                      if (keysText) {
                        navigator.clipboard.writeText(keysText);
                        toast.success('All product keys copied to clipboard!');
                      } else {
                        toast.error('No keys assigned yet.');
                      }
                    }}
                    className="bg-primary text-white hover:bg-primary/90 px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span> COPY
                  </button>
                  {selectedOrder.items && selectedOrder.items.some((i) => i.product?.downloadUrl) && (
                    <a
                      href={selectedOrder.items.find((i) => i.product?.downloadUrl)?.product?.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary text-white hover:bg-primary/90 px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span> DOWNLOAD
                    </a>
                  )}
                </div>
              </div>

              <div className="border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden text-sm space-y-4 p-4 bg-neutral-50 dark:bg-neutral-900/50">
                {(selectedOrder.items || []).map((item, idx) => {
                  const rawKeyStr = item.licenseKey || item.product?.licenseKey || '';
                  const keysList = rawKeyStr ? rawKeyStr.split(',').map((k) => k.trim()) : [];
                  return (
                    <div key={item.id || idx} className="space-y-2">
                      <div className="bg-neutral-200 dark:bg-neutral-800 px-3 py-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider rounded border border-neutral-300/50 dark:border-neutral-700/50">
                        {item.quantity}X {(item.product?.name || 'SOFTWARE LICENSE PRODUCT').toUpperCase()}
                      </div>
                      <div className="space-y-2 pt-1">
                        {keysList.length > 0 ? (
                          keysList.map((keyVal, keyIdx) => (
                            <div
                              key={keyIdx}
                              className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 p-3.5 rounded-xl text-blue-600 dark:text-blue-400 font-mono text-sm font-bold flex items-center justify-between"
                            >
                              <span className="select-all">{keyVal}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(keyVal);
                                  toast.success('Product key copied!');
                                }}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-sans font-bold cursor-pointer underline flex items-center gap-1 ml-4"
                              >
                                <span className="material-symbols-outlined text-[14px]">content_copy</span> Copy
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="p-3.5 bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 rounded-xl flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">License Key:</span>
                            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50 rounded-lg text-xs font-bold inline-flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                              Pending
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer Close & Invoice Buttons */}
            <div className="flex justify-between items-center pt-2 border-t border-outline-variant/30">
              <button
                onClick={() => setInvoiceOrder(selectedOrder)}
                className="px-5 py-2 bg-primary text-white hover:bg-primary-hover font-bold text-xs rounded-full transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                Generate Invoice
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 text-neutral-800 dark:text-neutral-200 font-bold text-xs rounded-full transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INVOICE POPUP MODAL ── */}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
    </main>
  );
}
