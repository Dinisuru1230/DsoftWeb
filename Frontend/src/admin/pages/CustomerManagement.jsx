import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  SRI_LANKA_PROVINCES,
  SRI_LANKA_CITIES_BY_PROVINCE,
} from '../../data/sriLankaLocationData';

const API_BASE = 'http://localhost:5050/api';

function Avatar({ name }) {
  const initials = name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  const colors = ['bg-primary-container text-primary', 'bg-secondary-container text-secondary', 'bg-tertiary-container text-tertiary'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold font-label-md text-sm flex-shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

// ── Validation helpers ──
function validateCustomerForm(data, isCreate) {
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
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
  } else if (data.password) {
    if (data.password.length < 6) {
      errors.password = 'New password must be at least 6 characters.';
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
  }
  if (data.phone) {
    const digits = data.phone.replace(/\D/g, '');
    if (digits.length !== 9) {
      errors.phone = 'Phone must be exactly 9 digits after +94 (e.g. 77 123 4567).';
    }
  }
  if (data.postalCode) {
    const digits = data.postalCode.replace(/\D/g, '');
    if (digits.length !== 5) {
      errors.postalCode = 'Postal code must be exactly 5 digits (e.g. 10350).';
    }
  }
  return errors;
}

const BLANK_FORM = {
  name: '', email: '', password: '', confirmPassword: '',
  phone: '', address: '', province: 'Western Province', city: 'Colombo 03', postalCode: '',
};

export default function CustomerManagement() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState(BLANK_FORM);

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  async function fetchCustomers() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/customers`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) {
        setCustomers(data.customers);
      } else {
        toast.error(data.error || 'Failed to load customers');
      }
    } catch {
      toast.error('Network error — cannot reach backend server');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone || '').includes(q);
  });

  function resetForm() {
    setFormData(BLANK_FORM);
    setFieldErrors({});
    setFormError('');
  }

  function openCreate() { resetForm(); setIsCreateOpen(true); }

  function openEdit(c) {
    setEditingCustomer(c);
    const rawPhone = (c.phone || '').replace('+94', '').replace(/\s/g, '');
    const province = c.province || 'Western Province';
    const citiesForProvince = SRI_LANKA_CITIES_BY_PROVINCE[province] || [];
    const city = c.city && citiesForProvince.includes(c.city) ? c.city : (citiesForProvince[0] || '');

    setFormData({
      name: c.name,
      email: c.email,
      password: '',
      confirmPassword: '',
      phone: rawPhone,
      address: c.address || '',
      province,
      city,
      postalCode: c.postalCode || '',
    });
    setFieldErrors({});
    setFormError('');
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    if (name === 'province') {
      const cities = SRI_LANKA_CITIES_BY_PROVINCE[value] || [];
      setFormData(prev => ({ ...prev, province: value, city: cities[0] || '' }));
    } else if (name === 'phone') {
      let val = value.replace(/\D/g, '');
      if (val.startsWith('0')) val = val.substring(1);
      if (val.length > 9) val = val.substring(0, 9);
      setFormData(prev => ({ ...prev, phone: val }));
    } else if (name === 'postalCode') {
      let val = value.replace(/\D/g, '');
      if (val.length > 5) val = val.substring(0, 5);
      setFormData(prev => ({ ...prev, postalCode: val }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setFormError('');
  }

  // CREATE
  async function handleCreate(e) {
    e.preventDefault();
    const errors = validateCustomerForm(formData, true);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please fix the highlighted errors before saving.');
      return;
    }
    setSaving(true);
    setFormError('');
    const toastId = toast.loading('Creating customer account...');

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone ? `+94${formData.phone}` : '',
      address: formData.address,
      city: formData.city,
      district: formData.province,
      postalCode: formData.postalCode,
    };

    try {
      const res = await fetch(`${API_BASE}/users/customers`, {
        method: 'POST', headers: authHeaders, body: JSON.stringify(payload),
      });
      const data = await res.json();
      setSaving(false);
      if (res.ok) {
        setCustomers([data.customer, ...customers]);
        setIsCreateOpen(false);
        resetForm();
        toast.success(`Customer "${data.customer.name}" created successfully!`, { id: toastId });
      } else {
        const msg = data.error || 'Failed to create customer';
        setFormError(msg);
        toast.error(msg, { id: toastId });
      }
    } catch {
      setSaving(false);
      toast.error('Network error. Could not create customer.', { id: toastId });
    }
  }

  // UPDATE
  async function handleUpdate(e) {
    e.preventDefault();
    const errors = validateCustomerForm(formData, false);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please fix the highlighted errors before saving.');
      return;
    }
    setSaving(true);
    setFormError('');
    const toastId = toast.loading('Updating customer profile...');

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone ? `+94${formData.phone}` : '',
      address: formData.address,
      city: formData.city,
      district: formData.province,
      postalCode: formData.postalCode,
    };
    if (formData.password) payload.password = formData.password;

    try {
      const res = await fetch(`${API_BASE}/users/customers/${editingCustomer.id}`, {
        method: 'PUT', headers: authHeaders, body: JSON.stringify(payload),
      });
      const data = await res.json();
      setSaving(false);
      if (res.ok) {
        setCustomers(prev => prev.map(c =>
          c.id === editingCustomer.id
            ? { ...data.customer, orders: c.orders }
            : c
        ));
        setEditingCustomer(null);
        resetForm();
        toast.success(`Customer "${data.customer.name}" updated successfully!`, { id: toastId });
      } else {
        const msg = data.error || 'Failed to update customer';
        setFormError(msg);
        toast.error(msg, { id: toastId });
      }
    } catch {
      setSaving(false);
      toast.error('Network error. Could not update customer.', { id: toastId });
    }
  }

  // DELETE
  async function handleDelete() {
    if (!deleteTarget) return;
    const toastId = toast.loading(`Deleting ${deleteTarget.name}...`);
    try {
      const res = await fetch(`${API_BASE}/users/customers/${deleteTarget.id}`, {
        method: 'DELETE', headers: authHeaders,
      });
      if (res.ok) {
        setCustomers(customers.filter(c => c.id !== deleteTarget.id));
        setDeleteTarget(null);
        toast.success(`Customer account deleted successfully.`, { id: toastId });
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete customer', { id: toastId });
      }
    } catch {
      toast.error('Network error deleting customer', { id: toastId });
    }
  }

  return (
    <div className="p-6 md:p-10 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-background">Customer Management</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {loading ? 'Loading...' : `${customers.length} registered customer${customers.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-label-md text-label-md hover:bg-primary/80 transition-colors cursor-pointer shadow-ambient font-bold"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            type="text" placeholder="Search by name, email or phone..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-full font-body-md text-on-surface outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden border border-outline-variant/30">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-primary text-2xl">sync</span>
            <span className="font-label-md">Loading customers...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl text-outline">group_off</span>
            <p className="font-label-md">{search ? 'No customers match your search.' : 'No customers yet.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                  {['Customer', 'Contact', 'Location', 'Orders', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 font-label-md text-label-md text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-body-md text-sm">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.name} />
                        <div>
                          <p className="font-title-sm text-sm text-on-surface font-bold">{c.name}</p>
                          <p className="font-label-sm text-xs text-on-surface-variant">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant max-w-[160px] truncate">{[c.city, c.province].filter(Boolean).join(', ') || c.address || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 bg-primary-container text-primary px-2.5 py-0.5 rounded-full font-label-sm text-xs font-bold">
                        <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
                        {c.orders}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant">{c.joined}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewingCustomer(c)} title="View Customer Details" className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/40 rounded-lg transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button onClick={() => openEdit(c)} title="Edit Customer" className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-secondary-container/40 rounded-lg transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => setDeleteTarget(c)} title="Delete Customer" className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {isCreateOpen && (
        <Modal title="Add New Customer" onClose={() => { setIsCreateOpen(false); resetForm(); }}>
          <CustomerForm
            formData={formData} onChange={handleFormChange}
            onSubmit={handleCreate} onCancel={() => { setIsCreateOpen(false); resetForm(); }}
            saving={saving} formError={formError} fieldErrors={fieldErrors} isCreate
          />
        </Modal>
      )}

      {editingCustomer && (
        <Modal title="Edit Customer" onClose={() => { setEditingCustomer(null); resetForm(); }}>
          <CustomerForm
            formData={formData} onChange={handleFormChange}
            onSubmit={handleUpdate} onCancel={() => { setEditingCustomer(null); resetForm(); }}
            saving={saving} formError={formError} fieldErrors={fieldErrors}
          />
        </Modal>
      )}

      {viewingCustomer && (
        <Modal title="Customer Details" onClose={() => setViewingCustomer(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-xl">
                {viewingCustomer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-title-sm text-on-surface font-bold text-lg">{viewingCustomer.name}</p>
                <p className="font-label-sm text-on-surface-variant text-sm">{viewingCustomer.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-outline-variant">
              <InfoRow label="Phone" value={viewingCustomer.phone || '—'} />
              <InfoRow label="Total Orders" value={viewingCustomer.orders} />
              <InfoRow label="Address" value={viewingCustomer.address || '—'} />
              <InfoRow label="City" value={viewingCustomer.city || '—'} />
              <InfoRow label="Province" value={viewingCustomer.province || '—'} />
              <InfoRow label="Joined" value={viewingCustomer.joined} />
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingCustomer(null)} className="px-5 py-2 bg-surface-container border border-outline-variant rounded-full font-label-md text-label-md hover:bg-surface-container-high transition-colors cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Customer" onClose={() => setDeleteTarget(null)}>
          <div className="flex items-start gap-3 mb-5 p-3 bg-error-container/30 rounded-lg">
            <span className="material-symbols-outlined text-error mt-0.5">warning</span>
            <p className="font-body-md text-body-md text-on-surface">
              Are you sure you want to permanently delete <strong>{deleteTarget.name}</strong>?
              This will remove their account and all data. This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteTarget(null)} className="px-5 py-2 border border-outline-variant rounded-full font-label-md text-label-md hover:bg-surface-container transition-colors cursor-pointer">
              Cancel
            </button>
            <button onClick={handleDelete} className="px-5 py-2 bg-error text-white rounded-full font-label-md text-label-md hover:bg-error/80 transition-colors cursor-pointer flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-[16px]">delete_forever</span>
              Delete Customer
            </button>
          </div>
        </Modal>
      )}
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

// ── Customer Form with full validation + dropdowns ──
function CustomerForm({ formData, onChange, onSubmit, onCancel, saving, formError, fieldErrors, isCreate }) {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const availableCities = SRI_LANKA_CITIES_BY_PROVINCE[formData.province] || [];

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword;

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
          placeholder="e.g. Amara Perera"
          className={inputCls(fieldErrors.name)} />
      </Field>

      <Field label="Email Address *" error={fieldErrors.email}>
        <input name="email" type="email" value={formData.email} onChange={onChange}
          placeholder="customer@example.com"
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

      <Field label={isCreate ? 'Confirm Password *' : 'Confirm New Password'} error={fieldErrors.confirmPassword}>
        <div className="relative">
          <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} value={formData.confirmPassword} onChange={onChange}
            placeholder="Re-enter password"
            className={inputCls(fieldErrors.confirmPassword) + ' pr-10'} />
          <button type="button" onClick={() => setShowConfirm(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">{showConfirm ? 'visibility' : 'visibility_off'}</span>
          </button>
        </div>
        {(passwordsMatch || passwordsMismatch) && (
          <p className={`text-xs mt-1 font-label-sm flex items-center gap-1 ${passwordsMatch ? 'text-primary' : 'text-error'}`}>
            <span className="material-symbols-outlined text-[14px]">{passwordsMatch ? 'check_circle' : 'cancel'}</span>
            {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
          </p>
        )}
      </Field>

      {/* ── Contact & Address ── */}
      <SectionTitle icon="location_on" title="Contact & Address" />

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

      <Field label="Street Address" error={fieldErrors.address}>
        <input name="address" type="text" value={formData.address} onChange={onChange}
          placeholder="e.g. 42 Flower Lane"
          className={inputCls(fieldErrors.address)} />
      </Field>

      <Field label="Province / District *" error={fieldErrors.province}>
        <div className={`relative rounded-lg border ${fieldErrors.province ? 'border-error' : 'border-outline-variant'} focus-within:border-primary transition-colors bg-surface-container-low`}>
          <select name="province" value={formData.province} onChange={onChange}
            className="w-full px-3 py-2.5 bg-transparent font-body-md text-on-surface outline-none cursor-pointer appearance-none pr-8">
            {SRI_LANKA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant">expand_more</span>
        </div>
      </Field>

      <Field label="City *" error={fieldErrors.city}>
        <div className={`relative rounded-lg border ${fieldErrors.city ? 'border-error' : 'border-outline-variant'} focus-within:border-primary transition-colors bg-surface-container-low`}>
          <select name="city" value={formData.city} onChange={onChange}
            className="w-full px-3 py-2.5 bg-transparent font-body-md text-on-surface outline-none cursor-pointer appearance-none pr-8">
            {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant">expand_more</span>
        </div>
      </Field>

      <Field label="Postal Code" error={fieldErrors.postalCode}>
        <input name="postalCode" type="text" value={formData.postalCode} onChange={onChange}
          placeholder="e.g. 10350"
          maxLength={10}
          className={inputCls(fieldErrors.postalCode)} />
      </Field>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 border border-outline-variant rounded-full font-label-md text-label-md hover:bg-surface-container transition-colors cursor-pointer">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="px-5 py-2.5 bg-primary text-white rounded-full font-label-md text-label-md hover:bg-primary/80 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 font-bold shadow-ambient">
          {saving
            ? <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
            : <span className="material-symbols-outlined text-[16px]">{isCreate ? 'person_add' : 'save'}</span>
          }
          {isCreate ? 'Create Customer' : 'Save Changes'}
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
      <p className="font-body-md text-sm text-on-surface font-semibold">{value}</p>
    </div>
  );
}

function inputCls(hasError) {
  return `w-full px-3 py-2.5 bg-surface-container-low border rounded-lg font-body-md text-on-surface outline-none focus:border-primary transition-colors ${
    hasError ? 'border-error bg-error-container/10' : 'border-outline-variant'
  }`;
}
