import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

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

const STATUS_KEYS = ['ALL', 'BANK_SLIP_PENDING', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderManagement() {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Bank Slip Modal State
  const [viewingSlipOrder, setViewingSlipOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [token]);

  async function fetchOrders() {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, newStatus) {
    if (!token) return;
    const targetOrder = orders.find((o) => o.id === id || o.orderNumber === id);
    const orderNum = targetOrder?.orderNumber || id;
    const toastId = toast.loading(`Updating order ${orderNum}...`);

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id || o.orderNumber === id ? { ...o, orderStatus: newStatus } : o))
        );
        if (viewingSlipOrder && (viewingSlipOrder.id === id || viewingSlipOrder.orderNumber === id)) {
          setViewingSlipOrder(null);
        }

        if (newStatus === 'CONFIRMED') {
          toast.success(`Order ${orderNum} approved and confirmed!`, { id: toastId });
        } else if (newStatus === 'CANCELLED') {
          toast.success(`Order ${orderNum} cancelled. Product stocks restored!`, { id: toastId });
        } else {
          toast.success(`Order ${orderNum} updated to ${STATUS_LABELS[newStatus] || newStatus}`, { id: toastId });
        }
      } else {
        const errorMsg = data.error || 'Failed to update order status.';
        toast.error(errorMsg, { id: toastId });
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Network error. Could not update order status.', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  }

  function approveBankSlip(id) {
    updateStatus(id, 'CONFIRMED');
  }

  function rejectBankSlip(id) {
    updateStatus(id, 'CANCELLED');
  }

  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    const matchesSearch =
      (o.orderNumber && o.orderNumber.toLowerCase().includes(search.toLowerCase())) ||
      (o.customerName && o.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (o.email && o.email.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const slipPendingCount = orders.filter((o) => o.orderStatus === 'BANK_SLIP_PENDING').length;

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary mb-1">Order Management</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Track, verify bank slips, manage inventory and process customer orders.</p>
        </div>

        {/* Bank Slip Notification Pill */}
        {slipPendingCount > 0 && (
          <button
            onClick={() => setStatusFilter('BANK_SLIP_PENDING')}
            className="bg-tertiary-container text-on-background px-4 py-2 rounded-full font-label-md text-label-md flex items-center gap-2 shadow-ambient hover:opacity-90 cursor-pointer animate-pulse"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">upload_file</span>
            <span>{slipPendingCount} Bank Slip(s) Need Verification</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
        {STATUS_KEYS.filter((s) => s !== 'ALL').map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`p-3.5 rounded-xl text-center transition-all cursor-pointer ${
              statusFilter === status
                ? 'shadow-ambient-lg border-2 border-primary scale-105'
                : 'shadow-ambient border border-outline-variant/30'
            } bg-surface-container-lowest`}
          >
            <p className="font-headline-md-mobile text-primary font-bold" style={{ fontSize: '22px' }}>
              {orders.filter((o) => o.orderStatus === status).length}
            </p>
            <p className="font-label-sm text-[11px] text-on-surface-variant truncate">
              {STATUS_LABELS[status] || status}
            </p>
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-ambient border border-outline-variant/30">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order Number, Customer, Email..."
            className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface outline-none transition-colors"
          />
        </div>

        <div className="flex gap-2 flex-wrap overflow-x-auto w-full md:w-auto">
          {STATUS_KEYS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full font-label-md text-label-md transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-primary text-white font-bold'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {s === 'ALL' ? 'All Orders' : STATUS_LABELS[s] || s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                <th className="p-4 font-label-md text-label-md text-on-surface-variant">Order Number</th>
                <th className="p-4 font-label-md text-label-md text-on-surface-variant">Customer</th>
                <th className="p-4 font-label-md text-label-md text-on-surface-variant">Payment Method</th>
                <th className="p-4 font-label-md text-label-md text-on-surface-variant">Total Amount</th>
                <th className="p-4 font-label-md text-label-md text-on-surface-variant">Order Status</th>
                <th className="p-4 font-label-md text-label-md text-on-surface-variant text-right">Bank Slip Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-md text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-2xl text-primary mb-2">sync</span>
                    <p>Loading real customer orders...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">inbox</span>
                    <p>No orders found matching your search.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const paymentDisplay =
                    order.paymentMethod === 'BANK_TRANSFER'
                      ? 'Bank Transfer'
                      : order.paymentMethod === 'CARD'
                      ? 'Card'
                      : 'COD';

                  const createdDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Recent';

                  return (
                    <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="p-4">
                        <Link to={`/admin/orders/${order.id}`} className="font-title-sm text-primary font-bold hover:underline">
                          {order.orderNumber}
                        </Link>
                        <p className="font-label-sm text-xs text-on-surface-variant">{createdDate}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-on-surface">{order.customerName}</p>
                        <p className="font-label-sm text-xs text-on-surface-variant">{order.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-[11px] bg-surface-container border border-outline-variant/40">
                          <span className="material-symbols-outlined text-[14px]">
                            {order.paymentMethod === 'BANK_TRANSFER' ? 'upload_file' : order.paymentMethod === 'CARD' ? 'credit_card' : 'payments'}
                          </span>
                          {paymentDisplay}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-primary">Rs. {Number(order.totalAmount || 0).toLocaleString()}</td>
                      <td className="p-4">
                        <div className="relative inline-block">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            disabled={actionLoading}
                            className={`px-3 py-1 pr-8 rounded-full font-label-sm text-[11px] border-0 outline-none appearance-none cursor-pointer ${STATUS_COLORS[order.orderStatus] || ''}`}
                          >
                            {STATUS_KEYS.filter((s) => s !== 'ALL').map((s) => (
                              <option key={s} value={s} className="bg-surface-container-lowest text-on-surface">
                                {STATUS_LABELS[s] || s}
                              </option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-[16px] text-primary">
                            unfold_more
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {order.paymentMethod === 'BANK_TRANSFER' || order.bankSlipUrl ? (
                          <button
                            onClick={() => setViewingSlipOrder(order)}
                            className="px-3 py-1.5 bg-primary-container text-on-background rounded-lg font-label-md text-xs hover:bg-primary hover:text-white transition-all flex items-center justify-end gap-1.5 ml-auto cursor-pointer shadow-sm font-bold"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            View Bank Slip
                          </button>
                        ) : (
                          <span className="text-xs text-outline italic">No slip required</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- BANK SLIP VERIFICATION MODAL --- */}
      {viewingSlipOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-outline-variant/30 space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">upload_file</span> Bank Slip Payment Verification
              </h2>
              <button onClick={() => setViewingSlipOrder(null)} className="text-on-surface-variant hover:text-primary cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 font-body-md text-sm">
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Order Number</span>
                <span className="font-bold text-primary">{viewingSlipOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Customer</span>
                <span className="font-bold text-on-surface">{viewingSlipOrder.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Total Transfer Amount</span>
                <span className="font-bold text-primary text-base">Rs. {Number(viewingSlipOrder.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Deposit Reference No.</span>
                <span className="font-bold text-secondary">{viewingSlipOrder.depositRef || 'N/A'}</span>
              </div>
            </div>

            {/* Slip Image Preview Box */}
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-2">Uploaded Receipt / Bank Slip</label>
              <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-low max-h-72 flex items-center justify-center p-2">
                {viewingSlipOrder.bankSlipUrl ? (
                  viewingSlipOrder.bankSlipUrl.endsWith('.pdf') ? (
                    <a
                      href={viewingSlipOrder.bankSlipUrl.startsWith('http') ? viewingSlipOrder.bankSlipUrl : `http://localhost:5050${viewingSlipOrder.bankSlipUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline flex items-center gap-2 py-8"
                    >
                      <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                      Open PDF Deposit Slip in New Tab
                    </a>
                  ) : (
                    <img
                      src={viewingSlipOrder.bankSlipUrl.startsWith('http') ? viewingSlipOrder.bankSlipUrl : `http://localhost:5050${viewingSlipOrder.bankSlipUrl}`}
                      alt="Bank Slip Upload"
                      className="max-h-64 object-contain rounded-lg shadow-sm"
                    />
                  )
                ) : (
                  <p className="text-on-surface-variant py-8">No slip file uploaded yet.</p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-outline-variant/30">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => rejectBankSlip(viewingSlipOrder.id)}
                className="w-full sm:w-1/2 py-3 px-4 bg-error-container text-on-error-container font-label-md text-label-md rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2.5 cursor-pointer font-bold disabled:opacity-50 shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">cancel</span>
                <span>Reject Slip (Restores Stock)</span>
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => approveBankSlip(viewingSlipOrder.id)}
                className="w-full sm:w-1/2 py-3 px-4 bg-primary-container text-on-background font-label-md text-label-md rounded-xl hover:bg-primary hover:text-white transition-all shadow-ambient flex items-center justify-center gap-2.5 cursor-pointer font-bold disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">task_alt</span>
                <span>Approve &amp; Confirm Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
