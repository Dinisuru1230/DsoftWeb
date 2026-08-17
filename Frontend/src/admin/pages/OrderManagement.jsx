import { useState } from 'react';
import { Link } from 'react-router-dom';

const INITIAL_ORDERS = [
  {
    id: 'MC-2024-149',
    customer: 'Kavindi Silva',
    email: 'kavindi@example.com',
    item: 'Artisan Silk Ribbon x2',
    date: '2024-08-11',
    status: 'Bank Slip Pending',
    total: 10800,
    items: 2,
    paymentMethod: 'Bank Transfer',
    bankSlipUrl: '/14_blush_silk_ribbon_bow.jpg',
    depositRef: 'REF-892103',
  },
  { id: 'MC-2024-148', customer: 'Amara Perera', email: 'amara@example.com', item: 'Blush Silk Ribbon Bow', date: '2024-08-10', status: 'Pending', total: 3600, items: 1, paymentMethod: 'COD' },
  { id: 'MC-2024-147', customer: 'Nimal Silva', email: 'nimal@example.com', item: 'Pearl Satin Scrunchie', date: '2024-08-10', status: 'Processing', total: 4500, items: 1, paymentMethod: 'Card' },
  { id: 'MC-2024-146', customer: 'Kasuni Fernando', email: 'kasuni@example.com', item: 'Woven Floral Headband + Ribbon', date: '2024-08-09', status: 'Delivered', total: 12000, items: 2, paymentMethod: 'Card' },
  { id: 'MC-2024-145', customer: 'Dilshan Mendis', email: 'dilshan@example.com', item: 'Hair Bows Set', date: '2024-08-09', status: 'Confirmed', total: 8400, items: 1, paymentMethod: 'COD' },
  { id: 'MC-2024-144', customer: 'Sachini Jayawardena', email: 'sachini@example.com', item: 'Artisan Silk Ribbon x3', date: '2024-08-08', status: 'Delivered', total: 16200, items: 3, paymentMethod: 'Card' },
  { id: 'MC-2024-143', customer: 'Ravindu Perera', email: 'ravindu@example.com', item: 'Cream Linen Bow', date: '2024-08-07', status: 'Cancelled', total: 4200, items: 1, paymentMethod: 'COD' },
];

const STATUS_COLORS = {
  'Bank Slip Pending': 'bg-tertiary-container text-on-background font-bold',
  Pending: 'bg-surface-container text-on-surface-variant',
  Processing: 'bg-secondary-container text-secondary',
  Confirmed: 'bg-primary-container text-primary font-bold',
  Delivered: 'bg-primary-container/40 text-on-surface-variant',
  Cancelled: 'bg-error-container text-error',
};

const STATUSES = ['All', 'Bank Slip Pending', 'Pending', 'Confirmed', 'Processing', 'Delivered', 'Cancelled'];

export default function OrderManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // Bank Slip Modal State
  const [viewingSlipOrder, setViewingSlipOrder] = useState(null);

  const filtered = orders.filter((o) =>
    (statusFilter === 'All' || o.status === statusFilter) &&
    (o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()))
  );

  function updateStatus(id, newStatus) {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: newStatus } : o));
  }

  function approveBankSlip(id) {
    updateStatus(id, 'Confirmed');
    setViewingSlipOrder(null);
  }

  function rejectBankSlip(id) {
    updateStatus(id, 'Cancelled');
    setViewingSlipOrder(null);
  }

  const slipPendingCount = orders.filter((o) => o.status === 'Bank Slip Pending').length;

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary mb-1">Order Management</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Track, verify bank slips, and process customer orders.</p>
        </div>

        {/* Bank Slip Notification Pill */}
        {slipPendingCount > 0 && (
          <button
            onClick={() => setStatusFilter('Bank Slip Pending')}
            className="bg-tertiary-container text-on-background px-4 py-2 rounded-full font-label-md text-label-md flex items-center gap-2 shadow-ambient hover:opacity-90 cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">upload_file</span>
            <span>{slipPendingCount} Bank Slip(s) Need Verification</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {STATUSES.filter(s => s !== 'All').map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`p-3.5 rounded-xl text-center transition-all cursor-pointer ${
              statusFilter === status ? 'shadow-ambient-lg border-2 border-primary scale-105' : 'shadow-ambient border border-outline-variant/30'
            } bg-surface-container-lowest`}
          >
            <p className="font-headline-md-mobile text-primary font-bold" style={{ fontSize: '22px' }}>
              {orders.filter(o => o.status === status).length}
            </p>
            <p className="font-label-sm text-[11px] text-on-surface-variant truncate">{status}</p>
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
            placeholder="Search Order ID or Customer..."
            className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface outline-none transition-colors"
          />
        </div>

        <div className="flex gap-2 flex-wrap overflow-x-auto w-full md:w-auto">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full font-label-md text-label-md transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-primary text-white font-bold'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {s}
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
                <th className="p-4 font-label-md text-label-md text-on-surface-variant">Order ID</th>
                <th className="p-4 font-label-md text-label-md text-on-surface-variant">Customer</th>
                <th className="p-4 font-label-md text-label-md text-on-surface-variant">Payment Method</th>
                <th className="p-4 font-label-md text-label-md text-on-surface-variant">Total</th>
                <th className="p-4 font-label-md text-label-md text-on-surface-variant">Order Status</th>
                <th className="p-4 font-label-md text-label-md text-on-surface-variant text-right">Bank Slip Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-md text-on-surface">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="p-4">
                    <Link to={`/admin/orders/${order.id}`} className="font-title-sm text-primary font-bold hover:underline">
                      {order.id}
                    </Link>
                    <p className="font-label-sm text-xs text-on-surface-variant">{order.date}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-on-surface">{order.customer}</p>
                    <p className="font-label-sm text-xs text-on-surface-variant">{order.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-[11px] bg-surface-container border border-outline-variant/40">
                      <span className="material-symbols-outlined text-[14px]">
                        {order.paymentMethod === 'Bank Transfer' ? 'upload_file' : order.paymentMethod === 'Card' ? 'credit_card' : 'payments'}
                      </span>
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-primary">Rs. {order.total.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`px-3 py-1 pr-8 rounded-full font-label-sm text-[11px] border-0 outline-none appearance-none cursor-pointer ${STATUS_COLORS[order.status] || ''}`}
                      >
                        {STATUSES.filter(s => s !== 'All').map((s) => (
                          <option key={s} value={s} className="bg-surface-container-lowest text-on-surface">
                            {s}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-[16px] text-primary">
                        unfold_more
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {order.paymentMethod === 'Bank Transfer' || order.bankSlipUrl ? (
                      <button
                        onClick={() => setViewingSlipOrder(order)}
                        className="px-3 py-1.5 bg-primary-container text-on-background rounded-lg font-label-md text-xs hover:bg-primary hover:text-white transition-all flex items-center justify-end gap-1.5 ml-auto cursor-pointer shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        View Bank Slip
                      </button>
                    ) : (
                      <span className="text-xs text-outline italic">No slip required</span>
                    )}
                  </td>
                </tr>
              ))}
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
              <button onClick={() => setViewingSlipOrder(null)} className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 font-body-md text-sm">
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Order ID</span>
                <span className="font-bold text-primary">{viewingSlipOrder.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Customer</span>
                <span className="font-bold text-on-surface">{viewingSlipOrder.customer}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Total Transfer Amount</span>
                <span className="font-bold text-primary text-base">Rs. {viewingSlipOrder.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Deposit Reference No.</span>
                <span className="font-bold text-secondary">{viewingSlipOrder.depositRef || 'REF-892103'}</span>
              </div>
            </div>

            {/* Slip Image Preview Box */}
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-2">Uploaded Receipt / Bank Slip Image</label>
              <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-low max-h-60 flex items-center justify-center p-2">
                <img
                  src={viewingSlipOrder.bankSlipUrl || '/14_blush_silk_ribbon_bow.jpg'}
                  alt="Bank Slip Upload"
                  className="max-h-56 object-contain rounded-lg shadow-sm"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => rejectBankSlip(viewingSlipOrder.id)}
                className="w-full sm:w-1/2 py-2.5 bg-error-container text-on-error-container font-label-md text-label-md rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                Reject Slip
              </button>
              <button
                type="button"
                onClick={() => approveBankSlip(viewingSlipOrder.id)}
                className="w-full sm:w-1/2 py-2.5 bg-primary-container text-on-background font-label-md text-label-md rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined text-[18px]">task_alt</span>
                Approve & Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
