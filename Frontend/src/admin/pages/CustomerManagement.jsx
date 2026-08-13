import { useState } from 'react';

const INITIAL_CUSTOMERS = [
  { id: 1, name: 'Amara Perera', email: 'amara@example.com', phone: '+94 77 123 4567', address: '42 Flower Lane, Colombo 03', orders: 5, total: 145.00, joined: '2024-01-15', status: 'Active' },
  { id: 2, name: 'Nimal Silva', email: 'nimal@example.com', phone: '+94 71 234 5678', address: '12 Main Street, Kandy', orders: 2, total: 40.00, joined: '2024-03-22', status: 'Active' },
  { id: 3, name: 'Kasuni Fernando', email: 'kasuni@example.com', phone: '+94 76 345 6789', address: '88 Beach Road, Galle', orders: 8, total: 320.00, joined: '2023-11-10', status: 'Active' },
  { id: 4, name: 'Dilshan Mendis', email: 'dilshan@example.com', phone: '+94 70 456 7890', address: '15 Station Road, Kurunegala', orders: 1, total: 28.00, joined: '2024-07-05', status: 'Active' },
  { id: 5, name: 'Sachini Jayawardena', email: 'sachini@example.com', phone: '+94 77 567 8901', address: '77 Lake Drive, Colombo 07', orders: 12, total: 580.00, joined: '2023-08-01', status: 'VIP' },
  { id: 6, name: 'Ravindu Perera', email: 'ravindu@example.com', phone: '+94 71 678 9012', address: '34 Temple Road, Negombo', orders: 0, total: 0, joined: '2024-08-01', status: 'Inactive' },
];

const STATUS_COLORS = {
  Active: 'bg-secondary-container text-secondary',
  VIP: 'bg-primary-container text-primary font-bold',
  Inactive: 'bg-surface-container text-on-surface-variant',
};

export default function CustomerManagement() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  // Form States for Create & Edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active',
  });

  // Filter Logic
  const filtered = customers.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle Form Change
  function handleFormChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // --- CRUD: CREATE ---
  function handleCreateSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    const newCust = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '+94 77 000 0000',
      address: formData.address || 'Colombo, Sri Lanka',
      orders: 0,
      total: 0.00,
      joined: new Date().toISOString().split('T')[0],
      status: formData.status,
    };

    setCustomers([newCust, ...customers]);
    setIsCreateOpen(false);
    resetForm();
  }

  // --- CRUD: UPDATE ---
  function openEditModal(customer) {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || '',
      status: customer.status,
    });
  }

  function handleEditSubmit(e) {
    e.preventDefault();
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === editingCustomer.id
          ? {
              ...c,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              status: formData.status,
            }
          : c
      )
    );
    setEditingCustomer(null);
    resetForm();
  }

  // --- CRUD: DELETE ---
  function handleDelete(id) {
    if (confirm('Are you sure you want to delete this customer account?')) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    }
  }

  function resetForm() {
    setFormData({ name: '', email: '', phone: '', address: '', status: 'Active' });
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary mb-1">Customer Management</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Create, edit, view, and manage your customer accounts and status.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="bg-primary-container text-on-background px-6 py-3 rounded-lg font-label-md text-label-md hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 shadow-ambient whitespace-nowrap cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add New Customer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, icon: 'group' },
          { label: 'Active', value: customers.filter((c) => c.status === 'Active').length, icon: 'person_check' },
          { label: 'VIP Customers', value: customers.filter((c) => c.status === 'VIP').length, icon: 'star' },
          { label: 'Total Revenue', value: `$${customers.reduce((s, c) => s + c.total, 0).toFixed(2)}`, icon: 'payments' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest rounded-xl p-4 shadow-ambient border border-outline-variant/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-[20px]">{stat.icon}</span>
              <p className="font-label-md text-label-md text-on-surface-variant">{stat.label}</p>
            </div>
            <p className="font-headline-md text-on-surface font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Status Filter Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-ambient border border-outline-variant/30 flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone..."
            className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface outline-none transition-colors"
          />
        </div>

        {/* Status Tabs Filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['All', 'Active', 'VIP', 'Inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-primary text-white font-bold'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant">Customer</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant">Phone</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant">Orders</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant">Total Spend</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant">Joined</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant">Status</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-md">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface font-bold group-hover:text-primary transition-colors">{c.name}</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{c.phone}</td>
                  <td className="px-4 py-3 font-bold text-on-surface">{c.orders}</td>
                  <td className="px-4 py-3 font-bold text-primary">${c.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-sm">{c.joined}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm ${STATUS_COLORS[c.status] || ''}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* View Button */}
                      <button
                        onClick={() => setViewingCustomer(c)}
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container/40 rounded-lg transition-colors cursor-pointer"
                        title="View Customer Profile"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-2 text-on-surface-variant hover:text-secondary hover:bg-secondary-container/40 rounded-lg transition-colors cursor-pointer"
                        title="Edit Customer"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer"
                        title="Delete Customer"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CREATE CUSTOMER MODAL --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-outline-variant/30 space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">person_add</span> Add New Customer
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g. Ruwan Silva"
                  className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface bg-transparent"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  placeholder="ruwan@example.com"
                  className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface bg-transparent"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Account Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  required
                  placeholder="••••••••"
                  className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface bg-transparent"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="+94 77 123 4567"
                  className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface bg-transparent"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  placeholder="123 Main St, Colombo"
                  className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface bg-transparent"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Customer Status</label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 pr-8 font-body-md text-body-md text-on-surface appearance-none cursor-pointer transition-colors"
                  >
                    <option value="Active" className="bg-surface-container-lowest text-on-surface py-2">Active</option>
                    <option value="VIP" className="bg-surface-container-lowest text-on-surface py-2">VIP</option>
                    <option value="Inactive" className="bg-surface-container-lowest text-on-surface py-2">Inactive</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-[20px]">
                    unfold_more
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-container text-on-background font-label-md text-label-md rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT CUSTOMER MODAL --- */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-outline-variant/30 space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">edit</span> Edit Customer Details
              </h2>
              <button onClick={() => setEditingCustomer(null)} className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface bg-transparent"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface bg-transparent"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface bg-transparent"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface bg-transparent"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">
                  Reset Password <span className="text-xs text-on-surface-variant font-normal">(Leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password || ''}
                  onChange={handleFormChange}
                  placeholder="Enter new password..."
                  className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface bg-transparent"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Customer Status</label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 pr-8 font-body-md text-body-md text-on-surface appearance-none cursor-pointer transition-colors"
                  >
                    <option value="Active" className="bg-surface-container-lowest text-on-surface py-2">Active</option>
                    <option value="VIP" className="bg-surface-container-lowest text-on-surface py-2">VIP</option>
                    <option value="Inactive" className="bg-surface-container-lowest text-on-surface py-2">Inactive</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-[20px]">
                    unfold_more
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-5 py-2.5 border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-container text-on-background font-label-md text-label-md rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW CUSTOMER PROFILE MODAL --- */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-outline-variant/30 space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">badge</span> Customer Details
              </h2>
              <button onClick={() => setViewingCustomer(null)} className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-2xl">
                {viewingCustomer.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-title-sm text-title-sm text-primary">{viewingCustomer.name}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">{viewingCustomer.email}</p>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full font-label-sm text-[11px] ${STATUS_COLORS[viewingCustomer.status]}`}>
                  {viewingCustomer.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 font-body-md text-body-md">
              <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant">Phone:</span>
                <span className="font-medium text-on-surface">{viewingCustomer.phone}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant">Address:</span>
                <span className="font-medium text-on-surface text-right max-w-[200px]">{viewingCustomer.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant">Total Orders:</span>
                <span className="font-bold text-primary">{viewingCustomer.orders}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant">Total Spend:</span>
                <span className="font-bold text-primary">${viewingCustomer.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-on-surface-variant">Joined Date:</span>
                <span className="text-on-surface-variant">{viewingCustomer.joined}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingCustomer(null)}
                className="w-full py-3 bg-primary-container text-on-background font-label-md text-label-md rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
