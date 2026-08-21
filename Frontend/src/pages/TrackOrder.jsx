import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import AccountSidebar from '../components/AccountSidebar';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

// Timeline steps matching Admin lifecycle (renamed 'Out for Delivery' to 'Shipped')
const LIFECYCLE_STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: 'receipt_long' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: 'verified' },
  { key: 'PROCESSING', label: 'Processing', icon: 'inventory_2' },
  { key: 'SHIPPED', label: 'Shipped', icon: 'local_shipping' },
  { key: 'DELIVERED', label: 'Delivered', icon: 'home' },
];

const STATUS_PROGRESS_MAP = {
  PENDING: 1,
  BANK_SLIP_PENDING: 1,
  CONFIRMED: 2,
  PROCESSING: 3,
  SHIPPED: 4,
  DELIVERED: 5,
  CANCELLED: 0,
};

const STATUS_LABELS = {
  BANK_SLIP_PENDING: 'Bank Slip Pending Verification',
  PENDING: 'Order Placed',
  PROCESSING: 'In Processing',
  CONFIRMED: 'Order Confirmed',
  SHIPPED: 'Package Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Order Cancelled',
};

export default function TrackOrder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || searchParams.get('order') || '';
  const [orderInput, setOrderInput] = useState(initialId);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialId.trim()) {
      fetchTracking(initialId.trim());
    }
  }, [initialId]);

  async function fetchTracking(orderNumber) {
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/orders/track/${encodeURIComponent(orderNumber.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data);
      } else {
        setOrder(null);
        setError(data.error || `Could not find order #${orderNumber}. Please check the order number.`);
      }
    } catch (err) {
      setOrder(null);
      setError('Network error while searching for order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (orderInput.trim()) {
      setSearchParams({ id: orderInput.trim() });
      fetchTracking(orderInput.trim());
    }
  }

  const currentProgressStep = order ? (STATUS_PROGRESS_MAP[order.orderStatus] ?? 1) : 0;
  const isCancelled = order?.orderStatus === 'CANCELLED';

  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const subtotal = (order?.items || []).reduce(
    (acc, i) => acc + (i.price || 0) * (i.quantity || 1),
    0
  );

  return (
    <main className="flex-grow flex flex-col md:flex-row w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 py-12 gap-8">
      {/* Unified Account Sidebar */}
      <AccountSidebar />

      {/* Main Content Area */}
      <section className="flex-grow space-y-6">
        <div>
          <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary mb-1">
            Track Your Order
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Enter your order number to see real-time updates and delivery status.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient max-w-xl border border-outline-variant/30">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow">
              <label className="font-label-md text-label-md text-on-surface mb-1 block">Order Number</label>
              <input
                type="text"
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
                placeholder="e.g. MC-849201"
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface outline-none focus:border-primary transition-colors uppercase placeholder:normal-case"
              />
            </div>
            <div className="sm:self-end">
              <button
                type="submit"
                disabled={loading || !orderInput.trim()}
                className="w-full sm:w-auto py-2.5 px-6 bg-primary text-white font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-ambient disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer font-bold"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">search</span>
                )}
                Track Order
              </button>
            </div>
          </form>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="bg-surface-container-lowest rounded-xl p-12 text-center text-on-surface-variant space-y-3 shadow-ambient border border-outline-variant/30">
            <span className="material-symbols-outlined animate-spin text-3xl text-primary">sync</span>
            <p className="font-body-md">Locating your order information...</p>
          </div>
        )}

        {/* Error / Not Found Banner */}
        {!loading && error && (
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-error-container text-center space-y-3">
            <div className="w-12 h-12 bg-error-container/40 text-error rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">search_off</span>
            </div>
            <h3 className="font-title-sm text-on-surface font-bold">Order Not Found</h3>
            <p className="font-body-md text-on-surface-variant text-sm max-w-md mx-auto">{error}</p>
            <p className="font-label-sm text-xs text-outline">
              Tip: You can find your Order Number in your order confirmation email or in your Order History.
            </p>
          </div>
        )}

        {/* Tracking Result Card */}
        {!loading && order && (
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 space-y-8">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b border-outline-variant/30 pb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-headline-md-mobile text-headline-md-mobile text-primary font-bold">
                    Order #{order.orderNumber}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full font-label-sm text-xs font-bold ${
                      isCancelled
                        ? 'bg-error-container text-error'
                        : order.orderStatus === 'DELIVERED'
                        ? 'bg-secondary-container text-secondary'
                        : 'bg-primary-container text-primary'
                    }`}
                  >
                    {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Placed on {orderDate} · Payment via {order.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : order.paymentMethod === 'CARD' ? 'Credit / Debit Card' : 'Cash on Delivery'}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider block">Total Amount</span>
                <span className="font-headline-md-mobile text-headline-md-mobile text-primary font-bold">
                  Rs. {Number(order.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Cancelled Banner */}
            {isCancelled && (
              <div className="p-4 bg-error-container/30 border border-error/20 rounded-xl flex items-center gap-3 text-error">
                <span className="material-symbols-outlined text-2xl">cancel</span>
                <div>
                  <p className="font-title-sm text-sm font-bold">This Order has been Cancelled</p>
                  <p className="font-body-md text-xs text-on-error-container">
                    The items have been returned to our boutique stock. If you have questions or need assistance, please contact support.
                  </p>
                </div>
              </div>
            )}

            {/* Progress Steps Timeline */}
            {!isCancelled && (
              <div className="py-4">
                <h3 className="font-label-md text-label-md text-on-surface mb-6 font-bold uppercase tracking-wider text-xs">
                  Delivery Progress
                </h3>
                <div className="relative">
                  {/* Steps with connecting segments */}
                  <div className="grid grid-cols-5 gap-1 sm:gap-4 relative z-10">
                    {LIFECYCLE_STEPS.map((step, index) => {
                      const stepNum = index + 1;
                      const isDone = currentProgressStep >= stepNum;
                      const isCurrent = currentProgressStep === stepNum;
                      const isNextDone = currentProgressStep > stepNum;

                      return (
                        <div key={step.key} className="relative flex flex-col items-center text-center gap-1.5 sm:gap-2">
                          {/* Segment connector to next step (for all except last step) */}
                          {index < LIFECYCLE_STEPS.length - 1 && (
                            <div
                              className={`absolute top-4 sm:top-5 left-1/2 w-full h-0.5 sm:h-1 -translate-y-1/2 pointer-events-none transition-colors duration-500 z-0 ${
                                isNextDone ? 'bg-primary' : 'bg-surface-container-high'
                              }`}
                            />
                          )}

                          {/* Step Icon Circle */}
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center relative z-10 transition-all ${
                              isDone
                                ? 'bg-primary text-white shadow-ambient scale-105'
                                : 'bg-surface-container border sm:border-2 border-outline-variant text-on-surface-variant'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[15px] sm:text-[20px]">
                              {isDone && !isCurrent && stepNum < currentProgressStep ? 'check' : step.icon}
                            </span>
                          </div>
                          <p
                            className={`font-label-sm text-[10px] sm:text-xs max-w-[70px] sm:max-w-[100px] leading-tight ${
                              isCurrent
                                ? 'text-primary font-bold scale-105'
                                : isDone
                                ? 'text-on-surface font-semibold'
                                : 'text-on-surface-variant'
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Order Items Section */}
            <div className="pt-6 border-t border-outline-variant/30 space-y-4">
              <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider text-xs">
                Items in This Order ({order.items?.length || 0})
              </h3>
              <div className="divide-y divide-outline-variant/20 border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-low/30">
                {(order.items || []).map((item, i) => (
                  <div key={item.id || i} className="p-4 flex items-center gap-4 hover:bg-surface-container-low/60 transition-colors">
                    <img
                      src={item.product?.image || '/14_blush_silk_ribbon_bow.jpg'}
                      alt={item.product?.name || 'Item'}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-outline-variant/30 bg-surface-container"
                    />
                    <div className="flex-grow">
                      <p className="font-title-sm text-sm text-on-surface font-bold">
                        {item.product?.name || 'Artisan Handcrafted Piece'}
                      </p>
                      <p className="font-body-md text-xs text-on-surface-variant">
                        {item.colorName ? `Variant: ${item.colorName} · ` : ''}Qty: {item.quantity} · Rs. {Number(item.price || 0).toLocaleString()} each
                      </p>
                    </div>
                    <span className="font-title-sm text-sm text-primary font-bold whitespace-nowrap">
                      Rs. {(Number(item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address & Price Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/30">
              {/* Shipping Address */}
              <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 space-y-2">
                <h4 className="font-label-md text-xs text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  Shipping Address
                </h4>
                <p className="font-title-sm text-sm text-on-surface font-bold">{order.customerName}</p>
                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">{order.address}</p>
                <p className="font-body-md text-xs text-on-surface-variant">Contact: {order.phone}</p>
              </div>

              {/* Order Cost Breakdown */}
              <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 space-y-2 font-body-md text-sm">
                <h4 className="font-label-md text-xs text-primary font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-[16px]">receipt</span>
                  Order Summary
                </h4>
                <div className="flex justify-between text-on-surface-variant text-xs">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant text-xs">
                  <span>Delivery Fee</span>
                  <span>{order.shippingCost === 0 ? 'FREE' : `Rs. ${(order.shippingCost || 0).toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between font-title-sm text-sm text-primary font-bold pt-2 border-t border-outline-variant/30">
                  <span>Total Amount Paid</span>
                  <span>Rs. {(order.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Customer Care Contact Link */}
            <div className="pt-2 flex justify-between items-center text-xs text-on-surface-variant">
              <span>Need updates or changes?</span>
              <Link to="/contact" className="text-primary font-bold hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">support_agent</span>
                Contact Support Team
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
