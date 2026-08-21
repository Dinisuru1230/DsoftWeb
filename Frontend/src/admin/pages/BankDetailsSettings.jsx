import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5050/api';

export default function BankDetailsSettings() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    branchName: '',
    swiftCode: '',
    bankNotes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/settings`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          bankName: data.bankName || 'Commercial Bank of Ceylon',
          accountName: data.accountName || 'Malmalee Creations (Pvt) Ltd',
          accountNumber: data.accountNumber || '8009 123 456',
          branchName: data.branchName || 'Colombo Main Branch',
          swiftCode: data.swiftCode || 'CCEYLKLX',
          bankNotes: data.bankNotes || 'Please include your contact number or order ID as the deposit reference.',
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
    setError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.bankName.trim()) return setError('Bank Name is required.');
    if (!form.accountName.trim()) return setError('Account Name is required.');
    if (!form.accountNumber.trim()) return setError('Account Number is required.');
    if (!form.branchName.trim()) return setError('Branch Name is required.');

    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save bank details.');
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-surface-container rounded w-64" />
        <div className="h-64 bg-surface-container rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-outline-variant/30 pb-4">
        <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary">
          Bank Account Details
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Manage your company bank account details displayed to customers during bank transfer checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Edit Form (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
              <span className="material-symbols-outlined text-primary text-[28px]">account_balance</span>
              <div>
                <h2 className="font-title-sm text-title-sm text-on-background">Account Information</h2>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">Official bank deposit credentials</p>
              </div>
            </div>

            {/* Bank Name */}
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                required
                placeholder="e.g. Commercial Bank of Ceylon"
                className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface transition-colors"
              />
            </div>

            {/* Account Name */}
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                Account Holder Name *
              </label>
              <input
                type="text"
                name="accountName"
                value={form.accountName}
                onChange={handleChange}
                required
                placeholder="e.g. Malmalee Creations (Pvt) Ltd"
                className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface transition-colors"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                Account Number *
              </label>
              <input
                type="text"
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                required
                placeholder="e.g. 8009 123 456"
                className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-primary font-bold transition-colors"
              />
            </div>

            {/* Branch & SWIFT in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                  Branch Name *
                </label>
                <input
                  type="text"
                  name="branchName"
                  value={form.branchName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Colombo Main Branch"
                  className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface transition-colors"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                  SWIFT / BIC Code
                </label>
                <input
                  type="text"
                  name="swiftCode"
                  value={form.swiftCode}
                  onChange={handleChange}
                  placeholder="e.g. CCEYLKLX"
                  className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface transition-colors"
                />
              </div>
            </div>

            {/* Deposit Instructions / Notes */}
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                Deposit Note / Reference Instructions
              </label>
              <textarea
                name="bankNotes"
                value={form.bankNotes}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. Please include your contact number or order ID as reference."
                className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface transition-colors resize-none"
              />
              <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-1">
                Instruction shown to customers below the bank information.
              </p>
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="flex items-center gap-2 text-error font-body-md text-body-md bg-error-container/30 px-4 py-3 rounded-lg">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-2 text-primary font-body-md text-body-md bg-primary-container/40 px-4 py-3 rounded-lg">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Bank details updated successfully!
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary-container text-on-background font-label-md text-label-md py-4 px-8 rounded-full hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold cursor-pointer shadow-ambient"
          >
            <span className="material-symbols-outlined text-[18px]">
              {saving ? 'hourglass_empty' : 'save'}
            </span>
            {saving ? 'Saving...' : 'Save Bank Details'}
          </button>
        </form>

        {/* Right Column: Live Customer Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md">
            <span className="material-symbols-outlined text-[20px] text-primary">visibility</span>
            <span>Customer Checkout Preview</span>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4">
              <span className="material-symbols-outlined text-primary text-3xl">account_balance</span>
              <div>
                <h3 className="font-title-sm text-title-sm text-primary">Bank Account Details</h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Malmalee Creations Official Bank Account</p>
              </div>
            </div>

            <div className="space-y-3 font-body-md text-sm">
              <div className="flex justify-between py-2 border-b border-outline-variant/20">
                <span className="text-on-surface-variant font-medium">Bank Name</span>
                <span className="font-bold text-on-surface">{form.bankName || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant/20">
                <span className="text-on-surface-variant font-medium">Account Name</span>
                <span className="font-bold text-on-surface">{form.accountName || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant/20">
                <span className="text-on-surface-variant font-medium">Account Number</span>
                <span className="font-bold text-primary text-base tracking-wide">{form.accountNumber || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant/20">
                <span className="text-on-surface-variant font-medium">Branch</span>
                <span className="font-bold text-on-surface">{form.branchName || '—'}</span>
              </div>
              {form.swiftCode && (
                <div className="flex justify-between py-2 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant font-medium">SWIFT Code</span>
                  <span className="font-bold text-on-surface">{form.swiftCode}</span>
                </div>
              )}
            </div>

            {form.bankNotes && (
              <div className="p-3 bg-primary-container/20 border border-primary/20 rounded-xl flex items-start gap-2 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">info</span>
                <span>{form.bankNotes}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
