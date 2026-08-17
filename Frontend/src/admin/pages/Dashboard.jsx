import { Link } from 'react-router-dom';

const STATS = [
  { label: 'Total Orders', value: '148', icon: 'shopping_cart', change: '+12%', color: 'text-primary' },
  { label: 'Total Revenue', value: '$4,820', icon: 'payments', change: '+8.3%', color: 'text-secondary' },
  { label: 'Pending Orders', value: '23', icon: 'schedule', change: '-2', color: 'text-tertiary' },
  { label: 'Low Stock Items', value: '5', icon: 'inventory_2', change: 'Alert', color: 'text-error' },
];

const RECENT_ORDERS = [
  { id: 'MC-2024-148', customer: 'Amara Perera', item: 'Blush Silk Ribbon Bow', date: '2024-08-10', status: 'Pending', total: '$12.00' },
  { id: 'MC-2024-147', customer: 'Nimal Silva', item: 'Pearl Satin Scrunchie', date: '2024-08-10', status: 'Processing', total: '$15.00' },
  { id: 'MC-2024-146', customer: 'Kasuni Fernando', item: 'Woven Floral Headband', date: '2024-08-09', status: 'Delivered', total: '$22.00' },
  { id: 'MC-2024-145', customer: 'Dilshan Mendis', item: 'Hair Bows Set', date: '2024-08-09', status: 'Confirmed', total: '$28.00' },
  { id: 'MC-2024-144', customer: 'Sachini Jayawardena', item: 'Artisan Silk Ribbon', date: '2024-08-08', status: 'Delivered', total: '$18.00' },
];

const STATUS_COLORS = {
  Pending: 'bg-tertiary-container text-tertiary',
  Processing: 'bg-secondary-container text-secondary',
  Confirmed: 'bg-primary-container text-primary',
  Delivered: 'bg-primary-container/50 text-on-surface-variant',
  Cancelled: 'bg-error-container text-error',
};

export default function Dashboard() {
  return (
    <div className="p-6 md:p-10 w-full">
      <div className="mb-8">
        <h1 className="font-headline-md text-headline-md text-on-background">Dashboard</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Welcome back! Here's what's happening with Malmalee Creations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient hover:shadow-ambient-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-full bg-primary-container/40 flex items-center justify-center ${stat.color}`}>
                <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
              </div>
              <span className={`font-label-sm text-label-sm ${stat.change.startsWith('+') ? 'text-primary' : stat.change.startsWith('-') ? 'text-error' : 'text-secondary'}`}>
                {stat.change}
              </span>
            </div>
            <p className="font-display-lg text-on-surface" style={{ fontSize: '32px' }}>{stat.value}</p>
            <p className="font-label-md text-label-md text-on-surface-variant mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant">
          <h2 className="font-title-sm text-title-sm text-primary">Recent Orders</h2>
          <Link to="/admin/orders" className="font-label-md text-label-md text-primary underline underline-offset-4 hover:text-on-primary-container transition-colors">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                {['Order ID', 'Customer', 'Item', 'Date', 'Status', 'Total'].map((h) => (
                  <th key={h} className="px-4 py-3 font-label-md text-label-md text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {RECENT_ORDERS.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-4 py-3 font-label-md text-label-md text-primary group-hover:underline">{order.id}</td>
                  <td className="px-4 py-3 font-body-md text-body-md text-on-surface">{order.customer}</td>
                  <td className="px-4 py-3 font-body-md text-body-md text-on-surface-variant">{order.item}</td>
                  <td className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant">{order.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm ${STATUS_COLORS[order.status] || 'bg-surface-container text-on-surface-variant'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-body-md text-body-md text-on-surface font-bold">{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
