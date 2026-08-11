import { useState } from 'react';
import { Link } from 'react-router-dom';

const ORDERS = [
  { id: 'MC-2024-148', customer: 'Amara Perera', email: 'amara@example.com', item: 'Blush Silk Ribbon Bow', date: '2024-08-10', status: 'Pending', total: 12.00, items: 1 },
  { id: 'MC-2024-147', customer: 'Nimal Silva', email: 'nimal@example.com', item: 'Pearl Satin Scrunchie', date: '2024-08-10', status: 'Processing', total: 15.00, items: 1 },
  { id: 'MC-2024-146', customer: 'Kasuni Fernando', email: 'kasuni@example.com', item: 'Woven Floral Headband + Ribbon', date: '2024-08-09', status: 'Delivered', total: 40.00, items: 2 },
  { id: 'MC-2024-145', customer: 'Dilshan Mendis', email: 'dilshan@example.com', item: 'Hair Bows Set', date: '2024-08-09', status: 'Confirmed', total: 28.00, items: 1 },
  { id: 'MC-2024-144', customer: 'Sachini Jayawardena', email: 'sachini@example.com', item: 'Artisan Silk Ribbon x3', date: '2024-08-08', status: 'Delivered', total: 54.00, items: 3 },
  { id: 'MC-2024-143', customer: 'Ravindu Perera', email: 'ravindu@example.com', item: 'Cream Linen Bow', date: '2024-08-07', status: 'Cancelled', total: 14.00, items: 1 },
];

const STATUS_COLORS = {
  Pending: 'bg-tertiary-container text-tertiary',
  Processing: 'bg-secondary-container text-secondary',
  Confirmed: 'bg-primary-container text-primary',
  Delivered: 'bg-primary-container/50 text-on-surface-variant',
  Cancelled: 'bg-error-container text-error',
};

const STATUSES = ['All', 'Pending', 'Confirmed', 'Processing', 'Delivered', 'Cancelled'];

export default function OrderManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [orders, setOrders] = useState(ORDERS);

  const filtered = orders.filter((o) =>
    (statusFilter === 'All' || o.status === statusFilter) &&
    (o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()))
  );

  function updateStatus(id, newStatus) {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: newStatus } : o));
  }

  return (
    <div className="p-6 md:p-10 w-full">
      <div className="mb-8">
        <h1 className="font-headline-md text-headline-md text-on-background">Order Management</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Track, update, and manage all customer orders.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {STATUSES.filter(s => s !== 'All').map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`p-3 rounded-xl text-center transition-all duration-200 ${
              statusFilter === status ? 'shadow-ambient-lg scale-105' : 'shadow-ambient'
            } bg-surface-container-lowest`}
          >
            <p className="font-headline-md-mobile text-on-surface" style={{ fontSize: '24px' }}>
              {orders.filter(o => o.status === status).length}
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{status}</p>
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="bg-surface-container-lowest rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-ambient">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID or Customer..."
            className="w-full bg-surface border-b-2 border-outline-variant focus:border-primary pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface focus:ring-0 outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-colors ${
                statusFilter === s ? 'bg-primary-container text-on-background' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                {['Order ID', 'Customer', 'Item(s)', 'Date', 'Total', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 font-label-md text-label-md text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-4 py-3">
                    <Link to={`/admin/orders/${order.id}`} className="font-label-md text-label-md text-primary hover:underline">
                      {order.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-body-md text-body-md text-on-surface">{order.customer}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{order.email}</p>
                  </td>
                  <td className="px-4 py-3 font-body-md text-body-md text-on-surface-variant max-w-[180px] truncate">{order.item}</td>
                  <td className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant">{order.date}</td>
                  <td className="px-4 py-3 font-body-md text-body-md text-on-surface font-bold">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`px-2 py-1 rounded-full font-label-sm text-label-sm border-0 focus:ring-0 outline-none cursor-pointer ${STATUS_COLORS[order.status] || ''}`}
                    >
                      {STATUSES.filter(s => s !== 'All').map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/orders/${order.id}`} className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors inline-flex">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
