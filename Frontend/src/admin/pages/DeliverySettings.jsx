import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

export default function DeliverySettings() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    standardShipping: '',
    expressShipping: '',
    freeShippingOver: '',
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
          standardShipping: String(data.standardShipping ?? 450),
          expressShipping: String(data.expressShipping ?? 1200),
          freeShippingOver: String(data.freeShippingOver ?? 15000),
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
    const standard = parseFloat(form.standardShipping);
    const express = parseFloat(form.expressShipping);
    const freeOver = parseFloat(form.freeShippingOver);

    if (isNaN(standard) || standard < 0) {
      toast.error('Standard delivery fee must be a valid number (Rs. 0 or more).');
      return setError('Standard fee must be a valid number ≥ 0.');
    }
    if (isNaN(express) || express < 0) {
      toast.error('Express delivery fee must be a valid number (Rs. 0 or more).');
      return setError('Express fee must be a valid number ≥ 0.');
    }
    if (express <= standard) {
      toast.error('Express delivery fee must be higher than standard delivery fee.');
      return setError('Express fee must be higher than standard fee.');
    }
    if (isNaN(freeOver) || freeOver < 0) {
      toast.error('Free shipping threshold must be a valid number (Rs. 0 or more).');
      return setError('Free shipping threshold must be a valid number ≥ 0.');
    }

    setSaving(true);
    setError('');
    const toastId = toast.loading('Updating store delivery fees...');

    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          standardShipping: standard,
          expressShipping: express,
          freeShippingOver: freeOver,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save delivery settings.');
      setSaved(true);
      toast.success('Default delivery rates updated successfully!', { id: toastId });
    } catch (err) {
      const msg = err.message || 'Could not save delivery settings. Please try again.';
      setError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-2xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-surface-container rounded w-64" />
        <div className="h-48 bg-surface-container rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-outline-variant/30 pb-4">
        <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary">
          Delivery Settings
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Set default delivery fees applied to all products. Products with custom fees override these defaults.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Standard Delivery */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
          <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
            <span className="material-symbols-outlined text-primary text-[28px]">local_shipping</span>
            <div>
              <h2 className="font-title-sm text-title-sm text-on-background">Standard Delivery</h2>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">3–5 Business Days</p>
            </div>
          </div>

          <div>
            <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
              Default Standard Delivery Fee (Rs.) *
            </label>
            <div className="flex items-center gap-2 border-b-2 border-outline-variant focus-within:border-primary transition-colors py-2">
              <span className="font-body-md text-body-md text-on-surface-variant">Rs.</span>
              <input
                type="number"
                name="standardShipping"
                value={form.standardShipping}
                onChange={handleChange}
                min="0"
                step="1"
                required
                placeholder="450"
                className="flex-1 bg-transparent outline-none font-body-md text-body-md text-on-surface"
              />
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-1">
              Applied when a product has no custom standard fee set.
            </p>
          </div>
        </div>

        {/* Express Delivery */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
          <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
            <span className="material-symbols-outlined text-primary text-[28px]">bolt</span>
            <div>
              <h2 className="font-title-sm text-title-sm text-on-background">Express Delivery</h2>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">1–2 Business Days</p>
            </div>
          </div>

          <div>
            <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
              Default Express Delivery Fee (Rs.) *
            </label>
            <div className="flex items-center gap-2 border-b-2 border-outline-variant focus-within:border-primary transition-colors py-2">
              <span className="font-body-md text-body-md text-on-surface-variant">Rs.</span>
              <input
                type="number"
                name="expressShipping"
                value={form.expressShipping}
                onChange={handleChange}
                min="0"
                step="1"
                required
                placeholder="1200"
                className="flex-1 bg-transparent outline-none font-body-md text-body-md text-on-surface"
              />
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-1">
              Applied when a product has no custom express fee set.
            </p>
          </div>
        </div>

        {/* Free Shipping Threshold */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
          <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
            <span className="material-symbols-outlined text-primary text-[28px]">redeem</span>
            <div>
              <h2 className="font-title-sm text-title-sm text-on-background">Free Shipping Threshold</h2>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                Orders above this amount get free standard delivery
              </p>
            </div>
          </div>

          <div>
            <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
              Minimum Order Value for Free Shipping (Rs.) *
            </label>
            <div className="flex items-center gap-2 border-b-2 border-outline-variant focus-within:border-primary transition-colors py-2">
              <span className="font-body-md text-body-md text-on-surface-variant">Rs.</span>
              <input
                type="number"
                name="freeShippingOver"
                value={form.freeShippingOver}
                onChange={handleChange}
                min="0"
                step="100"
                required
                placeholder="15000"
                className="flex-1 bg-transparent outline-none font-body-md text-body-md text-on-surface"
              />
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-1">
              Set to 0 to disable free shipping. Standard fee becomes FREE for orders above this amount.
            </p>
          </div>
        </div>

        {/* Summary Preview */}
        <div className="bg-primary-container/30 rounded-xl p-5 border border-primary/20">
          <h3 className="font-label-md text-label-md text-on-background mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">preview</span>
            Live Preview
          </h3>
          <div className="space-y-2 font-body-md text-body-md text-on-surface-variant">
            <div className="flex justify-between">
              <span>Standard Delivery</span>
              <span className="text-on-background font-medium">
                Rs. {parseFloat(form.standardShipping || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Express Delivery</span>
              <span className="text-on-background font-medium">
                Rs. {parseFloat(form.expressShipping || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t border-primary/20 pt-2 mt-2">
              <span>Free Standard Shipping on orders over</span>
              <span className="text-primary font-medium">
                Rs. {parseFloat(form.freeShippingOver || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="flex items-center gap-2 text-error font-body-md text-body-md bg-error-container/30 px-4 py-3 rounded-lg">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 text-primary font-body-md text-body-md bg-primary-container/40 px-4 py-3 rounded-lg">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Settings saved successfully!
          </div>
        )}

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary-container text-on-background font-label-md text-label-md py-4 px-8 rounded-full hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold"
        >
          <span className="material-symbols-outlined text-[18px]">
            {saving ? 'hourglass_empty' : 'save'}
          </span>
          {saving ? 'Saving…' : 'Save Delivery Settings'}
        </button>
      </form>
    </div>
  );
}
