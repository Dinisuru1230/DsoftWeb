import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

export default function ContactDetailsSettings() {
  const { token: authCtxToken } = useAuth();
  const [form, setForm] = useState({
    companyEmail: '',
    companyPhone: '',
    whatsappNumber: '',
    workingHours: '',
    facebookUrl: '',
    companyAddressLine1: '',
    companyAddressLine2: '',
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
          companyEmail: data.companyEmail || 'dsoftpack@gmail.com',
          companyPhone: data.companyPhone || '+94 78 681 7659',
          whatsappNumber: data.whatsappNumber || '+94 78 681 7659',
          workingHours: data.workingHours || '5:00 AM – 11:00 PM',
          facebookUrl: data.facebookUrl || 'https://www.facebook.com/share/19BFB5mDyC/',
          companyAddressLine1: data.companyAddressLine1 || '',
          companyAddressLine2: data.companyAddressLine2 || '',
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

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    const token = authCtxToken || localStorage.getItem('dsoftpack_token') || localStorage.getItem('malmalee_token') || localStorage.getItem('dsoft_token');
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update contact details');
      }

      setSaved(true);
      toast.success('Contact Us details updated successfully!');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display-lg text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[28px]">contact_support</span>
          Contact Us Details Settings
        </h1>
        <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
          Manage the public contact information displayed on the website's Contact Us page (Email, Phone, WhatsApp, Working Hours, Facebook link).
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          Website contact information has been updated successfully!
        </div>
      )}

      {error && (
        <div className="p-4 bg-error-container/30 border border-error/30 rounded-xl text-error text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">error</span>
          {error}
        </div>
      )}

      {/* Live Preview Cards Box */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="font-bold text-sm text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">visibility</span>
          Live Preview of Contact Us Page Cards
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Card 1 */}
          <div className="p-3 border border-outline-variant/30 rounded-lg bg-surface flex flex-col justify-between">
            <div>
              <p className="font-bold text-on-surface">Email Support</p>
              <p className="text-[10px] text-on-surface-variant">24/7 Digital Responses</p>
            </div>
            <p className="font-bold text-primary truncate mt-2">{form.companyEmail || 'Not set'}</p>
          </div>
          {/* Card 2 */}
          <div className="p-3 border border-outline-variant/30 rounded-lg bg-surface flex flex-col justify-between">
            <div>
              <p className="font-bold text-on-surface">Phone & WhatsApp</p>
              <p className="text-[10px] text-on-surface-variant">Direct Customer Line</p>
            </div>
            <p className="font-bold text-emerald-600 truncate mt-2">{form.companyPhone || 'Not set'}</p>
          </div>
          {/* Card 3 */}
          <div className="p-3 border border-outline-variant/30 rounded-lg bg-surface flex flex-col justify-between">
            <div>
              <p className="font-bold text-on-surface">Working Hours</p>
              <p className="text-[10px] text-on-surface-variant">{form.workingHours || 'Not set'}</p>
            </div>
            <span className="font-bold text-emerald-600 mt-2 text-[11px]">● Online Now</span>
          </div>
          {/* Card 4 */}
          <div className="p-3 border border-outline-variant/30 rounded-lg bg-surface flex flex-col justify-between">
            <div>
              <p className="font-bold text-on-surface">Facebook Page</p>
              <p className="text-[10px] text-on-surface-variant">Follow & Message</p>
            </div>
            <p className="font-bold text-blue-600 truncate mt-2">@dsoftpack</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="font-bold text-base text-on-surface border-b border-outline-variant/20 pb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">edit</span>
          Update Contact Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Support Email */}
          <div>
            <label className="font-label-md text-xs font-bold text-on-surface block mb-1">
              Support Email Address *
            </label>
            <input
              type="email"
              name="companyEmail"
              value={form.companyEmail}
              onChange={handleChange}
              required
              placeholder="e.g. dsoftpack@gmail.com"
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2.5 font-body-md text-sm text-on-surface focus:border-primary outline-none transition-colors"
            />
            <p className="text-[11px] text-on-surface-variant mt-1">Displayed under Email Support card</p>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="font-label-md text-xs font-bold text-on-surface block mb-1">
              Customer Phone Number *
            </label>
            <input
              type="text"
              name="companyPhone"
              value={form.companyPhone}
              onChange={handleChange}
              required
              placeholder="e.g. +94 78 681 7659"
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2.5 font-body-md text-sm text-on-surface focus:border-primary outline-none transition-colors"
            />
            <p className="text-[11px] text-on-surface-variant mt-1">Displayed under Phone & WhatsApp card</p>
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="font-label-md text-xs font-bold text-on-surface block mb-1">
              WhatsApp Number
            </label>
            <input
              type="text"
              name="whatsappNumber"
              value={form.whatsappNumber}
              onChange={handleChange}
              placeholder="e.g. +94 78 681 7659"
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2.5 font-body-md text-sm text-on-surface focus:border-primary outline-none transition-colors"
            />
            <p className="text-[11px] text-on-surface-variant mt-1">Direct click-to-chat WhatsApp number</p>
          </div>

          {/* Working Hours */}
          <div>
            <label className="font-label-md text-xs font-bold text-on-surface block mb-1">
              Working Hours *
            </label>
            <input
              type="text"
              name="workingHours"
              value={form.workingHours}
              onChange={handleChange}
              required
              placeholder="e.g. 5:00 AM – 11:00 PM"
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2.5 font-body-md text-sm text-on-surface focus:border-primary outline-none transition-colors"
            />
            <p className="text-[11px] text-on-surface-variant mt-1">Displayed under Working Hours card</p>
          </div>
        </div>

        {/* Facebook Page URL */}
        <div>
          <label className="font-label-md text-xs font-bold text-on-surface block mb-1">
            Facebook Page URL *
          </label>
          <input
            type="text"
            name="facebookUrl"
            value={form.facebookUrl}
            onChange={handleChange}
            required
            placeholder="e.g. https://www.facebook.com/share/19BFB5mDyC/"
            className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2.5 font-body-md text-sm text-on-surface focus:border-primary outline-none transition-colors"
          />
          <p className="text-[11px] text-on-surface-variant mt-1">Link used for the Facebook Page card button</p>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-outline-variant/20 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl shadow-xs hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                Saving Details...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">save</span>
                Save Contact Details
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
