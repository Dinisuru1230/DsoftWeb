import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

function Avatar({ name }) {
  const initials = name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  return (
    <div className="w-9 h-9 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold font-label-md text-sm flex-shrink-0">
      {initials}
    </div>
  );
}

// ── Validation ──
function validateAdminForm(data, isCreate) {
  const errors = {};
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (isCreate) {
    if (!data.password || data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
  } else if (data.password && data.password.length < 6) {
    errors.password = 'New password must be at least 6 characters.';
  }
  if (data.phone) {
    if (data.phone.length !== 9) {
      errors.phone = 'Phone must be exactly 9 digits after +94 (e.g. 77 123 4567).';
    }
  }
  return errors;
}

const BLANK_FORM = { name: '', email: '', password: '', phone: '' };

export default function AdminManagement() {
  const { token, user: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [viewingAdmin, setViewingAdmin] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState(BLANK_FORM);

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  async function fetchAdmins() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/admins`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setAdmins(data.admins);
      else setError(data.error || 'Failed to load admins');
    } catch {
      setError('Network error — cannot reach backend');
    }
    setLoading(false);
  }

  useEffect(() => { fetchAdmins(); }, []);

  const filtered = admins.filter((a) => {
    const q = search.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
  });

  function resetForm() {
    setFormData(BLANK_FORM);
    setFieldErrors({});
    setFormError('');
  }

  function openCreate() { resetForm(); setIsAdding(true); }

  function openEdit(a) {
    setEditingAdmin(a);
    // Strip +94 prefix from stored phone
    const rawPhone = (a.phone || '').replace('+94', '').replace(/\s/g, '');
    setFormData({ name: a.name, email: a.email, password: '', phone: rawPhone });
    setFieldErrors({});
    setFormError('');
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    if (name === 'phone') {
      let val = value.replace(/\D/g, '');
      if (val.startsWith('0')) val = val.substring(1);
      if (val.length > 9) val = val.substring(0, 9);
      setFormData(prev => ({ ...prev, phone: val }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setFormError('');
  }

  // CREATE
  async function handleCreate(e) {
    e.preventDefault();
    const errors = validateAdminForm(formData, true);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please fix the highlighted errors.');
      return;
    }
    setSaving(true);
    setFormError('');
    const toastId = toast.loading('Adding new admin member...');
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone ? `+94${formData.phone}` : '',
    };
    try {
      const res = await fetch(`${API_BASE}/users/admins`, {
        method: 'POST', headers: authHeaders, body: JSON.stringify(payload),
      });
      const data = await res.json();
      setSaving(false);
      if (res.ok) {
        setAdmins([data.admin, ...admins]);
        setIsAdding(false);
        resetForm();
        toast.success(`Admin "${data.admin.name}" added to the team!`, { id: toastId });
      } else {
        const msg = data.error || 'Failed to create admin';
        setFormError(msg);
        toast.error(msg, { id: toastId });
      }
    } catch {
      setSaving(false);
      toast.error('Network error. Could not add admin.', { id: toastId });
    }
  }

  // UPDATE
  async function handleUpdate(e) {
    e.preventDefault();
    const errors = validateAdminForm(formData, false);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please fix the highlighted errors.');
      return;
    }
    setSaving(true);
    setFormError('');
    const toastId = toast.loading('Updating admin account...');
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone ? `+94${formData.phone}` : '',
    };
    if (formData.password) payload.password = formData.password;

    try {
      const res = await fetch(`${API_BASE}/users/admins/${editingAdmin.id}`, {
        method: 'PUT', headers: authHeaders, body: JSON.stringify(payload),
      });
      const data = await res.json();
      setSaving(false);
      if (res.ok) {
        setAdmins(admins.map(a => a.id === editingAdmin.id ? data.admin : a));
        setEditingAdmin(null);
        resetForm();
        toast.success(`Admin "${data.admin.name}" updated successfully!`, { id: toastId });
      } else {
        const msg = data.error || 'Failed to update admin';
        setFormError(msg);
        toast.error(msg, { id: toastId });
      }
    } catch {
      setSaving(false);
      toast.error('Network error. Could not update admin.', { id: toastId });
    }
  }

  // DELETE
  async function handleDelete() {
    if (!deleteTarget) return;
    const toastId = toast.loading(`Removing ${deleteTarget.name}...`);
    try {
      const res = await fetch(`${API_BASE}/users/admins/${deleteTarget.id}`, {
        method: 'DELETE', headers: authHeaders,
      });
      const data = await res.json();
      if (res.ok) {
        setAdmins(admins.filter(a => a.id !== deleteTarget.id));
        toast.success(`Admin "${deleteTarget.name}" removed.`, { id: toastId });
        setDeleteTarget(null);
      } else {
        const msg = data.error || 'Failed to delete admin';
        setError(msg);
        toast.error(msg, { id: toastId });
        setDeleteTarget(null);
      }
    } catch {
      toast.error('Network error. Could not remove admin.', { id: toastId });
      setDeleteTarget(null);
    }
  }

  return (
    <div className="p-6 md:p-10 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-background">Admin Team</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {loading ? 'Loading...' : `${admins.length} admin account${admins.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-label-md text-label-md hover:bg-primary/80 transition-colors cursor-pointer shadow-ambient"
        >
          <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
          Add Admin
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg border border-error/30 font-label-md flex items-center justify-between">
          {error}
          <button onClick={() => setError('')} className="text-xs underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            type="text" placeholder="Search by name or email..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-full font-body-md text-on-surface outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Admin Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-primary text-2xl">sync</span>
          <span className="font-label-md">Loading admin team...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl text-outline">admin_panel_settings</span>
          <p className="font-label-md">{search ? 'No admins match your search.' : 'No admins found.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((a) => (
            <div key={a.id} className="bg-surface-container-lowest rounded-2xl shadow-ambient p-5 border border-outline-variant/40 hover:shadow-ambient-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={a.name} />
                  <div>
                    <p className="font-title-sm text-sm text-on-surface font-bold">{a.name}</p>
                    <p className="font-label-sm text-xs text-on-surface-variant">{a.email}</p>
                  </div>
                </div>
                {currentUser?.id === a.id && (
                  <span className="text-[10px] bg-primary-container text-primary px-2 py-0.5 rounded-full font-bold">You</span>
                )}
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">phone</span>
                  <span className="font-label-sm text-xs">{a.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                  <span className="font-label-sm text-xs">Joined {a.joined}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">admin_panel_settings</span>
                  <span className="font-label-sm text-xs bg-primary-container text-primary px-2 py-0.5 rounded-full font-bold">Admin</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-outline-variant">
                <button onClick={() => setViewingAdmin(a)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/30 rounded-lg transition-colors text-xs font-label-md cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">visibility</span> View
                </button>
                <button onClick={() => openEdit(a)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-on-surface-variant hover:text-secondary hover:bg-secondary-container/30 rounded-lg transition-colors text-xs font-label-md cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                </button>
                {currentUser?.id !== a.id && (
                  <button onClick={() => setDeleteTarget(a)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors text-xs font-label-md cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">delete</span> Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODALS ── */}
      {isAdding && (
        <Modal title="Add New Admin" onClose={() => { setIsAdding(false); resetForm(); }}>
          <AdminForm
            formData={formData} onChange={handleFormChange}
            onSubmit={handleCreate} onCancel={() => { setIsAdding(false); resetForm(); }}
            saving={saving} formError={formError} fieldErrors={fieldErrors} isCreate
          />
        </Modal>
      )}

      {editingAdmin && (
        <Modal title="Edit Admin" onClose={() => { setEditingAdmin(null); resetForm(); }}>
          <AdminForm
            formData={formData} onChange={handleFormChange}
            onSubmit={handleUpdate} onCancel={() => { setEditingAdmin(null); resetForm(); }}
            saving={saving} formError={formError} fieldErrors={fieldErrors}
          />
        </Modal>
      )}

      {viewingAdmin && (
        <Modal title="Admin Details" onClose={() => setViewingAdmin(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-xl">
                {viewingAdmin.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-title-sm text-on-surface font-bold text-lg">{viewingAdmin.name}</p>
                <p className="font-label-sm text-on-surface-variant text-sm">{viewingAdmin.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-outline-variant">
              <InfoRow label="Phone" value={viewingAdmin.phone || '—'} />
              <InfoRow label="Role" value="System Admin" />
              <InfoRow label="Joined" value={viewingAdmin.joined} />
              <InfoRow label="Account ID" value={viewingAdmin.id.slice(0, 8) + '...'} />
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingAdmin(null)} className="px-5 py-2 bg-surface-container border border-outline-variant rounded-full font-label-md text-label-md hover:bg-surface-container-high transition-colors cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Shared Confirmation Modal for Removing Admin */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Remove Admin"
        itemName={deleteTarget?.name}
        message={`Are you sure you want to remove "${deleteTarget?.name}" (${deleteTarget?.email}) from the admin team? They will immediately lose all admin dashboard access.`}
        confirmText="Remove Admin"
        cancelText="Cancel"
        variant="danger"
        icon="person_remove"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ── Reusable Modal ──
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">
          <h2 className="font-title-sm text-title-sm text-primary font-bold">{title}</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary p-1 cursor-pointer rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Admin Form ──
function AdminForm({ formData, onChange, onSubmit, onCancel, saving, formError, fieldErrors, isCreate }) {
  const [showPass, setShowPass] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {formError && (
        <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-label-md flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {formError}
        </div>
      )}

      {/* ── Personal Details ── */}
      <SectionTitle icon="person" title="Personal Details" />

      <Field label="Full Name *" error={fieldErrors.name}>
        <input name="name" type="text" value={formData.name} onChange={onChange}
          placeholder="e.g. Kavindi Silva"
          className={inputCls(fieldErrors.name)} />
      </Field>

      <Field label="Email Address *" error={fieldErrors.email}>
        <input name="email" type="email" value={formData.email} onChange={onChange}
          placeholder="admin@malmalee.lk"
          className={inputCls(fieldErrors.email)} />
      </Field>

      {/* ── Password ── */}
      <SectionTitle icon="lock" title={isCreate ? 'Set Password' : 'Change Password'} />
      {!isCreate && (
        <p className="text-xs text-on-surface-variant font-label-sm -mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">info</span>
          Leave blank to keep the existing password unchanged.
        </p>
      )}

      <Field label={isCreate ? 'Password *' : 'New Password'} error={fieldErrors.password}>
        <div className="relative">
          <input name="password" type={showPass ? 'text' : 'password'} value={formData.password} onChange={onChange}
            placeholder={isCreate ? 'Min. 6 characters' : 'Leave blank to keep current'}
            className={inputCls(fieldErrors.password) + ' pr-10'} />
          <button type="button" onClick={() => setShowPass(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">{showPass ? 'visibility' : 'visibility_off'}</span>
          </button>
        </div>
      </Field>

      {/* ── Contact ── */}
      <SectionTitle icon="phone" title="Contact" />

      <Field label="Phone Number (+94)" error={fieldErrors.phone}>
        <div className={`flex rounded-lg border overflow-hidden ${fieldErrors.phone ? 'border-error' : 'border-outline-variant'} focus-within:border-primary transition-colors`}>
          <span className="flex items-center px-3 bg-surface-container border-r border-outline-variant/60 text-sm font-label-md text-on-surface-variant whitespace-nowrap">
            +94
          </span>
          <input
            name="phone" type="tel" value={formData.phone} onChange={onChange}
            placeholder="77 123 4567"
            maxLength={9}
            className={`flex-1 px-3 py-2.5 bg-surface-container-low font-body-md text-on-surface outline-none ${fieldErrors.phone ? 'bg-error-container/10' : ''}`}
          />
          {formData.phone.length === 9 && (
            <span className="flex items-center pr-3 text-primary">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </span>
          )}
        </div>
        {formData.phone && formData.phone.length < 9 && (
          <p className="text-xs mt-1 text-on-surface-variant font-label-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">info</span>
            {formData.phone.length}/9 digits entered
          </p>
        )}
      </Field>

      {!isCreate && (
        <div className="p-3 bg-tertiary-container/40 rounded-lg">
          <p className="font-label-sm text-xs text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
            Role is always <strong>Admin</strong> and cannot be changed here.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 border border-outline-variant rounded-full font-label-md text-label-md hover:bg-surface-container transition-colors cursor-pointer">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="px-5 py-2.5 bg-primary text-white rounded-full font-label-md text-label-md hover:bg-primary/80 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2">
          {saving
            ? <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
            : <span className="material-symbols-outlined text-[16px]">{isCreate ? 'admin_panel_settings' : 'save'}</span>
          }
          {isCreate ? 'Create Admin' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

// ── Helpers ──
function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 pb-1.5 border-b border-outline-variant/60 mt-2">
      <span className="material-symbols-outlined text-[16px] text-primary">{icon}</span>
      <h3 className="font-label-sm text-xs text-primary font-bold uppercase tracking-widest">{title}</h3>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs">{label}</label>
      {children}
      {error && (
        <p className="text-xs text-error font-label-sm flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="font-label-sm text-xs text-on-surface-variant mb-0.5">{label}</p>
      <p className="font-body-md text-sm text-on-surface">{value}</p>
    </div>
  );
}

function inputCls(hasError) {
  return `w-full px-3 py-2.5 bg-surface-container-low border rounded-lg font-body-md text-on-surface outline-none focus:border-primary transition-colors ${
    hasError ? 'border-error bg-error-container/10' : 'border-outline-variant'
  }`;
}
