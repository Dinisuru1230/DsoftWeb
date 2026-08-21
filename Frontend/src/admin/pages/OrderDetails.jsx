import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5050/api';

const STATUS_COLORS = {
  BANK_SLIP_PENDING: 'bg-tertiary-container text-on-background font-bold',
  PENDING: 'bg-surface-container text-on-surface-variant',
  PROCESSING: 'bg-secondary-container text-secondary',
  CONFIRMED: 'bg-primary-container text-primary font-bold',
  SHIPPED: 'bg-primary-container/60 text-primary font-bold',
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

const ALL_STATUSES = ['BANK_SLIP_PENDING', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id, token]);

  async function fetchOrder() {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load order');
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(newStatus) {
    if (!token || !order) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status');
      setOrder(data.order);
    } catch (err) {
      alert(err.message || 'Error updating order status');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center space-y-4">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
        <p className="font-body-md text-on-surface-variant">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4 text-center">
        <div className="bg-error-container/30 text-error p-6 rounded-2xl">
          <p className="font-title-sm">{error || 'Order not found'}</p>
        </div>
        <Link to="/admin/orders" className="text-primary font-label-md underline inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Orders
        </Link>
      </div>
    );
  }

  const paymentDisplay =
    order.paymentMethod === 'BANK_TRANSFER'
      ? 'Bank Transfer'
      : order.paymentMethod === 'CARD'
      ? 'Card Payment'
      : 'Cash on Delivery (COD)';

  const createdDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent';

  const subtotal = (order.items || []).reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <div className="p-4 md:p-10 w-full max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
        <Link to="/admin/orders" className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Orders
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary font-bold">{order.orderNumber}</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary">Order {order.orderNumber}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{createdDate}</p>
        </div>
        <span className={`px-4 py-2 rounded-full font-label-md text-label-md ${STATUS_COLORS[order.orderStatus] || ''}`}>
          {STATUS_LABELS[order.orderStatus] || order.orderStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left (2 cols) — Items + Bank Slip */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Card */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-4">
            <h2 className="font-title-sm text-title-sm text-primary">Order Items ({order.items?.length || 0})</h2>
            <div className="divide-y divide-outline-variant/20 space-y-3">
              {(order.items || []).map((item, i) => (
                <div key={item.id || i} className="pt-3 first:pt-0 flex items-center gap-4">
                  <img
                    src={item.product?.image || '/14_blush_silk_ribbon_bow.jpg'}
                    alt={item.product?.name || 'Product'}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-outline-variant/30"
                  />
                  <div className="flex-grow">
                    <p className="font-title-sm text-title-sm text-on-surface font-bold">
                      {item.product?.name || 'Handcrafted Item'}
                    </p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant text-xs">
                      {item.colorName ? `Color: ${item.colorName} · ` : ''}Qty: {item.quantity} · Rs. {(item.price || 0).toLocaleString()} each
                    </p>
                  </div>
                  <span className="font-title-sm text-title-sm text-on-surface font-bold">
                    Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-outline-variant pt-4 space-y-2 font-body-md text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Shipping Cost</span>
                <span>{order.shippingCost === 0 ? 'FREE' : `Rs. ${(order.shippingCost || 0).toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between font-title-sm text-title-sm text-primary font-bold pt-2 border-t border-outline-variant">
                <span>Total Amount</span>
                <span>Rs. {(order.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Bank Slip Box (if Bank Transfer) */}
          {(order.paymentMethod === 'BANK_TRANSFER' || order.bankSlipUrl) && (
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">upload_file</span> Customer Bank Deposit Slip
                </h2>
                {order.depositRef && (
                  <span className="font-label-sm text-xs bg-secondary-container/50 text-secondary px-2.5 py-1 rounded-full font-bold">
                    Ref: {order.depositRef}
                  </span>
                )}
              </div>

              {order.bankSlipUrl ? (
                <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-low p-4 flex flex-col items-center justify-center">
                  {order.bankSlipUrl.endsWith('.pdf') ? (
                    <a
                      href={order.bankSlipUrl.startsWith('http') ? order.bankSlipUrl : `http://localhost:5050${order.bankSlipUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline flex items-center gap-2 py-6 font-bold"
                    >
                      <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                      View Uploaded PDF Bank Slip
                    </a>
                  ) : (
                    <a
                      href={order.bankSlipUrl.startsWith('http') ? order.bankSlipUrl : `http://localhost:5050${order.bankSlipUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="cursor-pointer group flex flex-col items-center"
                    >
                      <img
                        src={order.bankSlipUrl.startsWith('http') ? order.bankSlipUrl : `http://localhost:5050${order.bankSlipUrl}`}
                        alt="Customer Bank Slip"
                        className="max-h-80 object-contain rounded-lg shadow-sm group-hover:opacity-90 transition-opacity"
                      />
                      <span className="text-xs text-primary font-label-md mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">open_in_new</span> Click to open full-size in new tab
                      </span>
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-on-surface-variant text-sm italic">No deposit slip attached by customer yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Right (1 col) — Customer + Status Actions */}
        <div className="space-y-6">
          {/* Customer Details */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-4">
            <h2 className="font-title-sm text-title-sm text-primary">Customer Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-bold">{order.customerName}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant text-xs">{order.email}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant/20 space-y-2 font-body-md text-sm">
                <div className="flex items-start gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">phone</span>
                  <span>{order.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">location_on</span>
                  <span>{order.address}</span>
                </div>
                <div className="flex items-start gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">payment</span>
                  <span>Payment: {paymentDisplay}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Update Order Status */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-3">
            <h2 className="font-title-sm text-title-sm text-primary">Update Order Status</h2>
            <p className="font-body-md text-body-md text-on-surface-variant text-xs">
              Selecting &quot;Cancelled&quot; will automatically restore stock for all purchased items.
            </p>
            <div className="space-y-2 pt-1">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={updating}
                  onClick={() => updateStatus(s)}
                  className={`w-full py-2.5 px-4 rounded-xl font-label-md text-label-md text-left transition-all cursor-pointer flex items-center justify-between ${
                    order.orderStatus === s
                      ? 'bg-primary text-white font-bold shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span>{STATUS_LABELS[s] || s}</span>
                  {order.orderStatus === s && (
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
