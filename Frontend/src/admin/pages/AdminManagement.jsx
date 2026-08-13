import { useState } from 'react';

const INITIAL_ADMINS = [
  { id: 1, name: 'Pramod Wijenayake', email: 'pramod@malmalee.lk', phone: '+94 77 123 4567', role: 'Super Admin', joined: '2024-01-01', active: true },
  { id: 2, name: 'Amara Perera', email: 'amara@malmalee.lk', phone: '+94 71 234 5678', role: 'Store Admin', joined: '2024-02-15', active: true },
  { id: 3, name: 'Kavindi Silva', email: 'kavindi@malmalee.lk', phone: '+94 76 345 6789', role: 'Inventory Manager', joined: '2024-04-10', active: true },
  { id: 4, name: 'Nimal Fernando', email: 'nimal@malmalee.lk', phone: '+94 70 456 7890', role: 'Customer Support', joined: '2024-06-01', active: false },
];

const ROLES = ['Super Admin', 'Store Admin', 'Inventory Manager', 'Customer Support'];

export default function AdminManagement() {
  const [admins, setAdmins] = useState(INITIAL_ADMINS);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Store Admin',
    password: '',
  });

  const filtered = admins.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = admins.filter((a) => a.active).length;
  const superAdminCount = admins.filter((a) => a.role === 'Super Admin').length;

  function toggleActive(id) {
    setAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  }

  function deleteAdmin(id) {
    if (confirm('Are you sure you want to remove this admin user?')) {
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    }
  }

  function handleAdd(e) {
    e.preventDefault();
    if (!newForm.name.trim() || !newForm.email.trim()) return;
    setAdmins((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newForm.name,
        email: newForm.email,
        phone: newForm.phone || '+94 77 000 0000',
        role: newForm.role,
        joined: new Date().toISOString().split('T')[0],
        active: true,
      },
    ]);
    setNewForm({ name: '', email: '', phone: '', role: 'Store Admin', password: '' });
    setAdding(false);
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary mb-1">Admin Management</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage team members, roles, and administrative access.</p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="bg-primary-container text-on-background px-6 py-3 rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-ambient whitespace-nowrap cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">{adding ? 'close' : 'person_add'}</span>
          {adding ? 'Cancel' : 'Add New Admin'}
        </button>
      </div>

      {/* Add Admin Form */}
      {adding && (
        <form onSubmit={handleAdd} className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-6">
          <h3 className="font-title-sm text-title-sm text-primary border-b border-outline-variant/30 pb-3">
            Add New Admin Team Member
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-label-md text-label-md text-on-surface mb-2 block">Full Name *</label>
              <input
                type="text"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                placeholder="e.g. Kasun Kalhara"
                required
                className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface bg-transparent"
              />
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface mb-2 block">Email Address *</label>
              <input
                type="email"
                value={newForm.email}
                onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                placeholder="kasun@malmalee.lk"
                required
                className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface bg-transparent"
              />
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface mb-2 block">Phone Number</label>
              <input
                type="tel"
                value={newForm.phone}
                onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                placeholder="+94 77 123 4567"
                className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface bg-transparent"
              />
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface mb-2 block">Admin Role *</label>
              <div className="relative">
                <select
                  value={newForm.role}
                  onChange={(e) => setNewForm({ ...newForm, role: e.target.value })}
                  className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 pr-8 font-body-md text-body-md text-on-surface appearance-none cursor-pointer transition-colors"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="bg-surface-container-lowest text-on-surface py-2">
                      {r}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-[20px]">
                  unfold_more
                </span>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="font-label-md text-label-md text-on-surface mb-2 block">Temporary Password *</label>
              <input
                type="password"
                value={newForm.password}
                onChange={(e) => setNewForm({ ...newForm, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface bg-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-8 py-3 bg-primary-container text-on-background font-label-md text-label-md rounded-lg shadow-ambient hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Admin User
            </button>
          </div>
        </form>
      )}

      {/* Bento Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/20 flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Admin Team</p>
            <h2 className="font-title-sm text-headline-md text-primary">{admins.length}</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-container/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/20 flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Active Admins</p>
            <h2 className="font-title-sm text-headline-md text-primary">{activeCount}</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary-container/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary">verified_user</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/20 flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Super Admins</p>
            <h2 className="font-title-sm text-headline-md text-primary">{superAdminCount}</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-tertiary-container/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary">shield</span>
          </div>
        </div>
      </div>

      {/* Main Data Table Section */}
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/20 overflow-hidden flex flex-col">
        {/* Search Bar */}
        <div className="p-4 md:p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-bright">
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search admins by name, email, or role..."
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-body-md focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-colors placeholder:text-outline outline-none"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Admin User</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Phone</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Role</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Joined Date</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center">Status</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-md text-on-surface">
              {filtered.map((adm) => (
                <tr key={adm.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-primary shrink-0">
                        {adm.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-primary font-title-sm text-base block">{adm.name}</span>
                        <span className="font-body-md text-xs text-on-surface-variant">{adm.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant text-sm font-body-md">{adm.phone}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-label-sm text-[11px] font-bold ${
                      adm.role === 'Super Admin'
                        ? 'bg-primary-container text-on-background'
                        : adm.role === 'Store Admin'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {adm.role}
                    </span>
                  </td>
                  <td className="p-4 text-on-surface-variant text-sm">{adm.joined}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleActive(adm.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full font-label-sm text-[11px] uppercase tracking-wide cursor-pointer transition-colors ${
                        adm.active
                          ? 'bg-secondary-container text-on-secondary-container font-bold'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {adm.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleActive(adm.id)}
                        className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-low cursor-pointer"
                        title={adm.active ? 'Deactivate Admin' : 'Activate Admin'}
                      >
                        <span className="material-symbols-outlined text-[20px]">{adm.active ? 'visibility_off' : 'visibility'}</span>
                      </button>
                      <button
                        onClick={() => deleteAdmin(adm.id)}
                        className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error-container/50 cursor-pointer"
                        title="Delete Admin"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/30 flex justify-between items-center bg-surface-bright">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Showing {filtered.length} of {admins.length} admin accounts</span>
        </div>
      </div>
    </div>
  );
}
