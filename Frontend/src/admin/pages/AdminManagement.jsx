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
  const [roleFilter, setRoleFilter] = useState('All');

  // Modal / Form States
  const [isAdding, setIsAdding] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [viewingAdmin, setViewingAdmin] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Store Admin',
    active: true,
  });

  const filtered = admins.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search);
    const matchesRole = roleFilter === 'All' || a.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const activeCount = admins.filter((a) => a.active).length;
  const superAdminCount = admins.filter((a) => a.role === 'Super Admin').length;

  function handleFormChange(e) {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  }

  function resetForm() {
    setFormData({ name: '', email: '', phone: '', role: 'Store Admin', active: true });
  }

  // --- CRUD: CREATE ---
  function handleCreateSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    const newAdmin = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '+94 77 000 0000',
      role: formData.role,
      joined: new Date().toISOString().split('T')[0],
      active: formData.active,
    };

    setAdmins([newAdmin, ...admins]);
    setIsAdding(false);
    resetForm();
  }

  // --- CRUD: UPDATE / EDIT ---
  function openEditModal(admin) {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      active: admin.active,
    });
  }

  function handleEditSubmit(e) {
    e.preventDefault();
    setAdmins((prev) =>
      prev.map((a) =>
        a.id === editingAdmin.id
          ? {
              ...a,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              role: formData.role,
              active: formData.active,
            }
          : a
      )
    );
    setEditingAdmin(null);
    resetForm();
  }

  // --- CRUD: DELETE ---
  function handleDelete(id) {
    if (confirm('Are you sure you want to remove this admin user account?')) {
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    }
  }

  function toggleActiveStatus(id) {
    setAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary mb-1">Admin Management</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Full CRUD management for admin accounts, roles, and system permissions.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="bg-primary-container text-on-background px-6 py-3 rounded-lg font-label-md text-label-md hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 shadow-ambient whitespace-nowrap cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add New Admin
        </button>
      </div>

      {/* Bento Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Admin Team</p>
            <h2 className="font-headline-md text-primary font-bold">{admins.length}</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-container/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Active Admins</p>
            <h2 className="font-headline-md text-primary font-bold">{activeCount}</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary-container/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary">verified_user</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Super Admins</p>
            <h2 className="font-headline-md text-primary font-bold">{superAdminCount}</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-tertiary-container/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary">shield</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
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

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['All', ...ROLES].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-colors cursor-pointer whitespace-nowrap ${
                roleFilter === role
                  ? 'bg-primary text-white font-bold'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Main Data Table Section */}
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/30 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                <th className="p-4 font-label-md text-label-md text-on-surface-variant">Admin User</th>
                <th className="p-4 font-label-md text-label-md text-on-surface-variant">Phone</th>
                <th className="p-4 font-label-md text-label-md text-on-surface-variant">Role</th>
                <th className="p-4 font-label-md text-label-md text-on-surface-variant">Joined Date</th>
                <th className="p-4 font-label-md text-label-md text-on-surface-variant text-center">Status</th>
                <th className="p-4 font-label-md text-label-md text-on-surface-variant text-right">Actions</th>
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
                        <span className="font-bold text-primary font-title-sm text-base block group-hover:underline">{adm.name}</span>
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
                      onClick={() => toggleActiveStatus(adm.id)}
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
                      {/* View Action */}
                      <button
                        onClick={() => setViewingAdmin(adm)}
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container/40 rounded-lg transition-colors cursor-pointer"
                        title="View Admin Profile"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      {/* Edit Action */}
                      <button
                        onClick={() => openEditModal(adm)}
                        className="p-2 text-on-surface-variant hover:text-secondary hover:bg-secondary-container/40 rounded-lg transition-colors cursor-pointer"
                        title="Edit Admin"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      {/* Delete Action */}
                      <button
                        onClick={() => handleDelete(adm.id)}
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer"
                        title="Delete Admin Account"
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

      {/* --- CREATE ADMIN MODAL --- */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-outline-variant/30 space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">person_add</span> Add New Admin Account
              </h2>
              <button onClick={() => setIsAdding(false)} className="text-on-surface-variant hover:text-primary">
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
                  placeholder="e.g. Kasun Kalhara"
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
                  placeholder="kasun@malmalee.lk"
                  className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface bg-transparent"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Temporary Password *</label>
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
                <label className="font-label-md text-label-md text-on-surface block mb-1">Admin Role *</label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
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

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleFormChange}
                  className="accent-primary h-4 w-4"
                />
                <label htmlFor="active" className="font-label-md text-label-md text-on-surface cursor-pointer">
                  Activate this Admin Account immediately
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-5 py-2.5 border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-container text-on-background font-label-md text-label-md rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT ADMIN MODAL --- */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-outline-variant/30 space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">edit</span> Edit Admin Account
              </h2>
              <button onClick={() => setEditingAdmin(null)} className="text-on-surface-variant hover:text-primary">
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
                <label className="font-label-md text-label-md text-on-surface block mb-1">
                  Reset Password <span className="text-xs text-on-surface-variant font-normal">(Leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password || ''}
                  onChange={handleFormChange}
                  placeholder="Enter new admin password..."
                  className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface bg-transparent"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Admin Role *</label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
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

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  name="active"
                  checked={formData.active}
                  onChange={handleFormChange}
                  className="accent-primary h-4 w-4"
                />
                <label htmlFor="edit-active" className="font-label-md text-label-md text-on-surface cursor-pointer">
                  Account Active Status
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-5 py-2.5 border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-container text-on-background font-label-md text-label-md rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  Save Admin Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW ADMIN DETAILS MODAL --- */}
      {viewingAdmin && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-outline-variant/30 space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">admin_panel_settings</span> Admin Account Profile
              </h2>
              <button onClick={() => setViewingAdmin(null)} className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-2xl">
                {viewingAdmin.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-title-sm text-title-sm text-primary">{viewingAdmin.name}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">{viewingAdmin.email}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full font-label-sm text-[11px] bg-primary-container text-on-background font-bold">
                  {viewingAdmin.role}
                </span>
              </div>
            </div>

            <div className="space-y-3 font-body-md text-body-md">
              <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant">Phone:</span>
                <span className="font-medium text-on-surface">{viewingAdmin.phone}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant">Account Status:</span>
                <span className={`font-bold ${viewingAdmin.active ? 'text-secondary' : 'text-outline'}`}>
                  {viewingAdmin.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-on-surface-variant">Joined Date:</span>
                <span className="text-on-surface-variant">{viewingAdmin.joined}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingAdmin(null)}
                className="w-full py-3 bg-primary-container text-on-background font-label-md text-label-md rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                Close Admin Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
