import { useState } from 'react';

const CUSTOMERS = [
  { id: 1, name: 'Amara Perera', email: 'amara@example.com', phone: '+94 77 123 4567', orders: 5, total: 145.00, joined: '2024-01-15', status: 'Active' },
  { id: 2, name: 'Nimal Silva', email: 'nimal@example.com', phone: '+94 71 234 5678', orders: 2, total: 40.00, joined: '2024-03-22', status: 'Active' },
  { id: 3, name: 'Kasuni Fernando', email: 'kasuni@example.com', phone: '+94 76 345 6789', orders: 8, total: 320.00, joined: '2023-11-10', status: 'Active' },
  { id: 4, name: 'Dilshan Mendis', email: 'dilshan@example.com', phone: '+94 70 456 7890', orders: 1, total: 28.00, joined: '2024-07-05', status: 'Active' },
  { id: 5, name: 'Sachini Jayawardena', email: 'sachini@example.com', phone: '+94 77 567 8901', orders: 12, total: 580.00, joined: '2023-08-01', status: 'VIP' },
  { id: 6, name: 'Ravindu Perera', email: 'ravindu@example.com', phone: '+94 71 678 9012', orders: 0, total: 0, joined: '2024-08-01', status: 'Inactive' },
];

const STATUS_COLORS = {
  Active: 'bg-secondary-container text-secondary',
  VIP: 'bg-primary-container text-primary',
  Inactive: 'bg-surface-container text-on-surface-variant',
};

export default function CustomerManagement() {
  const [search, setSearch] = useState('');
  const [customers] = useState(CUSTOMERS);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 w-full">
      <div className="mb-8">
        <h1 className="font-headline-md text-headline-md text-on-background">Customer Management</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">View and manage your customer accounts.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Customers', value: customers.length, icon: 'group' },
          { label: 'Active', value: customers.filter(c => c.status === 'Active').length, icon: 'person_check' },
          { label: 'VIP Customers', value: customers.filter(c => c.status === 'VIP').length, icon: 'star' },
          { label: 'Total Revenue', value: `$${customers.reduce((s, c) => s + c.total, 0).toFixed(0)}`, icon: 'payments' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest rounded-xl p-4 shadow-ambient">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">{stat.icon}</span>
              <p className="font-label-md text-label-md text-on-surface-variant">{stat.label}</p>
            </div>
            <p className="font-headline-md text-on-surface" style={{ fontSize: '28px' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-surface-container-lowest rounded-lg p-4 mb-6 shadow-ambient">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full bg-surface border-b-2 border-outline-variant focus:border-primary pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface focus:ring-0 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                {['Customer', 'Phone', 'Orders', 'Total Spend', 'Joined', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 font-label-md text-label-md text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">{c.name}</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-body-md text-body-md text-on-surface-variant">{c.phone}</td>
                  <td className="px-4 py-3 font-body-md text-body-md text-on-surface">{c.orders}</td>
                  <td className="px-4 py-3 font-body-md text-body-md text-on-surface font-bold">${c.total.toFixed(2)}</td>
                  <td className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant">{c.joined}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm ${STATUS_COLORS[c.status] || ''}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-outline-variant">
          {filtered.map((c) => (
            <div key={c.id} className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary">person</span>
              </div>
              <div className="flex-grow">
                <p className="font-title-sm text-title-sm text-on-surface">{c.name}</p>
                <p className="font-body-md text-body-md text-on-surface-variant">{c.email}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{c.orders} orders · ${c.total.toFixed(2)}</p>
              </div>
              <span className={`px-2 py-1 rounded-full font-label-sm text-label-sm ${STATUS_COLORS[c.status]}`}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
