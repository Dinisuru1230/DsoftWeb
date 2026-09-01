import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import LogoComponent from '../../components/LogoComponent';

const API_BASE = 'http://localhost:5050/api';

export default function InvoiceSettings() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    companyName: '',
    companyLegalName: '',
    companyAddressLine1: '',
    companyAddressLine2: '',
    companyTaxId: '',
    companyEmail: '',
    companyPhone: '',
    whatsappNumber: '',
    workingHours: '',
    facebookUrl: '',
    companyWebsite: '',
    invoiceFooterNote: '',
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
          companyName: data.companyName || 'DSoft Pack',
          companyLegalName: data.companyLegalName || 'DSoft Technologies LLC',
          companyAddressLine1: data.companyAddressLine1 || '5931 Greenville Ave #1169',
          companyAddressLine2: data.companyAddressLine2 || 'Dallas, TX 75206 US',
          companyTaxId: data.companyTaxId || 'EIN: 98-1860068',
          companyEmail: data.companyEmail || 'dsoftpack@gmail.com',
          companyPhone: data.companyPhone || '+94 78 681 7659',
          whatsappNumber: data.whatsappNumber || '+94 78 681 7659',
          workingHours: data.workingHours || '5:00 AM – 11:00 PM',
          facebookUrl: data.facebookUrl || 'https://www.facebook.com/share/19BFB5mDyC/',
          companyWebsite: data.companyWebsite || 'https://dsoftpack.com',
          invoiceFooterNote: data.invoiceFooterNote || 'Thank you for choosing DSoft Pack. For support queries, email us at dsoftpack@gmail.com',
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
    if (!form.companyName.trim()) {
      toast.error('Brand / Company Name is required.');
      return setError('Company Name is required.');
    }
    if (!form.companyEmail.trim()) {
      toast.error('Support Email is required.');
      return setError('Support Email is required.');
    }

    setSaving(true);
    setError('');
    const toastId = toast.loading('Updating invoice details...');

    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save invoice settings.');
      setSaved(true);
      toast.success('Invoice details updated successfully!', { id: toastId });
    } catch (err) {
      const msg = err.message || 'Could not save invoice details. Please try again.';
      setError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-surface-container rounded w-64" />
        <div className="h-64 bg-surface-container rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-outline-variant/30 pb-4">
        <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl">receipt_long</span>
          Invoice Details Settings
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Manage official company header information, address, tax ID, and contact details shown on all customer invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Edit Form (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
              <span className="material-symbols-outlined text-primary text-[28px]">business</span>
              <div>
                <h2 className="font-title-sm text-title-sm text-on-background">Company Header Information</h2>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">Printed on top-left of every invoice</p>
              </div>
            </div>

            {/* Company / Brand Name */}
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                Display Brand Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                required
                placeholder="e.g. DSoft Pack"
                className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface transition-colors font-bold"
              />
            </div>

            {/* Legal Entity Name */}
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                Legal Entity / Company Name
              </label>
              <input
                type="text"
                name="companyLegalName"
                value={form.companyLegalName}
                onChange={handleChange}
                placeholder="e.g. DSoft Technologies LLC"
                className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface transition-colors"
              />
            </div>

            {/* Address Line 1 & Line 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  name="companyAddressLine1"
                  value={form.companyAddressLine1}
                  onChange={handleChange}
                  placeholder="e.g. 5931 Greenville Ave #1169"
                  className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface transition-colors"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                  Address Line 2 (City / State / Postal)
                </label>
                <input
                  type="text"
                  name="companyAddressLine2"
                  value={form.companyAddressLine2}
                  onChange={handleChange}
                  placeholder="e.g. Dallas, TX 75206 US"
                  className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface transition-colors"
                />
              </div>
            </div>

            {/* Tax ID & Support Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                  Tax ID / EIN Number
                </label>
                <input
                  type="text"
                  name="companyTaxId"
                  value={form.companyTaxId}
                  onChange={handleChange}
                  placeholder="e.g. EIN: 98-1860068"
                  className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface transition-colors"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                  Support Email *
                </label>
                <input
                  type="email"
                  name="companyEmail"
                  value={form.companyEmail}
                  onChange={handleChange}
                  required
                  placeholder="e.g. contact@dsoftpack.com"
                  className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface transition-colors"
                />
              </div>
            </div>

            {/* Company Website */}
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                Company Website URL
              </label>
              <input
                type="text"
                name="companyWebsite"
                value={form.companyWebsite}
                onChange={handleChange}
                placeholder="e.g. https://dsoftpack.com"
                className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface transition-colors"
              />
            </div>

            {/* Footer Note */}
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                Invoice Footer Thank You Note / Terms
              </label>
              <textarea
                name="invoiceFooterNote"
                value={form.invoiceFooterNote}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. Thank you for choosing DSoft Pack. For support queries, email us at contact@dsoftpack.com"
                className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface transition-colors resize-none"
              />
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
              Invoice details updated successfully!
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
            {saving ? 'Saving...' : 'Save Invoice Details'}
          </button>
        </form>

        {/* Right Column: Live Invoice Header Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md">
            <span className="material-symbols-outlined text-[20px] text-primary">visibility</span>
            <span>Live Invoice Header Preview</span>
          </div>

          <div className="bg-white text-black rounded-xl p-6 shadow-xl border border-neutral-300 space-y-4">
            {/* Top Logo & Title */}
            <div className="flex justify-between items-center pb-3 border-b-2 border-neutral-800">
              <LogoComponent height="h-9" textSize="text-xl" useThemeColor={false} />
              <div className="text-right">
                <h3 className="text-xl font-black text-black tracking-wider">INVOICE</h3>
                <p className="text-[10px] font-bold text-neutral-500">DSP-123456</p>
              </div>
            </div>

            {/* Left: Dynamic Company Header */}
            <div className="space-y-0.5 text-xs text-neutral-800 font-sans border-b border-neutral-200 pb-3">
              <h4 className="text-sm font-bold text-black">{form.companyName || 'DSoft Pack'}</h4>
              {form.companyLegalName && <p className="font-semibold text-neutral-700">{form.companyLegalName}</p>}
              {form.companyAddressLine1 && <p className="text-neutral-600">{form.companyAddressLine1}</p>}
              {form.companyAddressLine2 && <p className="text-neutral-600">{form.companyAddressLine2}</p>}
              {form.companyTaxId && <p className="text-neutral-600">{form.companyTaxId}</p>}
              <p className="text-neutral-600">{form.companyEmail || 'contact@dsoftpack.com'}</p>
              {form.companyWebsite && <p className="text-neutral-600">{form.companyWebsite}</p>}
            </div>

            {/* Sample Item Row */}
            <div className="text-xs bg-neutral-50 p-2.5 rounded border border-neutral-200 space-y-1">
              <div className="flex justify-between font-bold text-black">
                <span>Microsoft Office 2021 Pro Plus</span>
                <span>$29.99</span>
              </div>
              <p className="text-[10px] text-neutral-500">Product Key: XXXXX-XXXXX-XXXXX-XXXXX</p>
            </div>

            {/* Dynamic Footer Note */}
            <div className="pt-2 text-[10px] text-neutral-500 italic text-center border-t border-neutral-200">
              {form.invoiceFooterNote || 'Thank you for choosing DSoft Pack.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
