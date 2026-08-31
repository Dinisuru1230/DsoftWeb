import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5050/api';

export default function EmailSettings() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');

  const [form, setForm] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'dsoftpack@gmail.com',
    smtpPass: '',
    smtpFromEmail: 'dsoftpack@gmail.com',
    smtpFromName: 'DSoft Pack',
    emailNotificationsEnabled: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/settings`);
      const data = await res.json();
      if (res.ok && data) {
        setForm({
          smtpHost: data.smtpHost || 'smtp.gmail.com',
          smtpPort: data.smtpPort || 587,
          smtpUser: data.smtpUser || 'dsoftpack@gmail.com',
          smtpPass: data.smtpPass || '',
          smtpFromEmail: data.smtpFromEmail || data.smtpUser || 'dsoftpack@gmail.com',
          smtpFromName: data.smtpFromName || 'DSoft Pack',
          emailNotificationsEnabled: data.emailNotificationsEnabled ?? true,
        });
        if (data.smtpUser) {
          setTestEmailAddress(data.smtpUser);
        }
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
      toast.error('Failed to load email settings.');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Saving email settings...');

    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          smtpPort: form.smtpPort ? parseInt(form.smtpPort, 10) : 587,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update email settings');

      toast.success('Email settings updated successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save settings', { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTestEmail() {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      toast.error('Please enter a valid target email address for testing.');
      return;
    }

    setTesting(true);
    const toastId = toast.loading(`Sending test email to ${testEmailAddress}...`);

    try {
      const res = await fetch(`${API_BASE}/settings/test-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetEmail: testEmailAddress }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send test email');

      toast.success(`Test email sent successfully to ${testEmailAddress}! Check your inbox.`, { id: toastId, duration: 5000 });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Test email failed. Please verify your SMTP settings.', { id: toastId, duration: 6000 });
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
          <p className="text-sm font-semibold text-on-surface-variant">Loading Email Configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* ── Page Title Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
            <span className="material-symbols-outlined text-[15px]">mail</span>
            SMTP Email Delivery Suite
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-background tracking-tight">
            Email &amp; Notification Settings
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Configure the email address and SMTP server used to send automated software license keys to customers.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-primary text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Automated Email Dispatch Toggle ── */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">mark_email_read</span>
              Automatic License Key Emails
            </h3>
            <p className="text-xs text-on-surface-variant max-w-xl leading-relaxed">
              When enabled, customers automatically receive an HTML email containing their software license key and download links whenever their order status reaches <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">DELIVERED / COMPLETED</span>.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              name="emailNotificationsEnabled"
              checked={form.emailNotificationsEnabled}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            <span className="ml-3 text-xs font-bold text-on-surface">
              {form.emailNotificationsEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        {/* ── Sender Information Card ── */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-3">
            <span className="material-symbols-outlined text-primary text-[22px]">badge</span>
            Sender Profile Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">
                Sender Email Address <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">email</span>
                <input
                  type="email"
                  name="smtpFromEmail"
                  value={form.smtpFromEmail}
                  onChange={(e) => {
                    handleChange(e);
                    // keep smtpUser in sync if not custom
                    setForm((prev) => ({ ...prev, smtpFromEmail: e.target.value, smtpUser: e.target.value }));
                  }}
                  placeholder="dsoftpack@gmail.com"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl pl-9 pr-4 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors"
                />
              </div>
              <p className="text-[11px] text-outline mt-1.5">
                The email address your customers will see in the "From" line of their inbox.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">
                Sender Display Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">store</span>
                <input
                  type="text"
                  name="smtpFromName"
                  value={form.smtpFromName}
                  onChange={handleChange}
                  placeholder="DSoft Pack"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl pl-9 pr-4 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors"
                />
              </div>
              <p className="text-[11px] text-outline mt-1.5">
                Example: <strong className="text-on-surface">DSoft Pack</strong> or <strong className="text-on-surface">DSoft Support</strong>
              </p>
            </div>
          </div>
        </div>

        {/* ── SMTP Server Authentication Card ── */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-3">
            <span className="material-symbols-outlined text-primary text-[22px]">dns</span>
            SMTP Server Credentials
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">
                SMTP Host Server
              </label>
              <input
                type="text"
                name="smtpHost"
                value={form.smtpHost}
                onChange={handleChange}
                placeholder="smtp.gmail.com"
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors"
              />
              <p className="text-[11px] text-outline mt-1.5">
                Default for Gmail is <code className="bg-surface-container px-1 py-0.5 rounded text-primary">smtp.gmail.com</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                name="smtpPort"
                value={form.smtpPort}
                onChange={handleChange}
                placeholder="587"
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors"
              />
              <p className="text-[11px] text-outline mt-1.5">
                Standard TLS Port: <code className="bg-surface-container px-1 py-0.5 rounded text-primary">587</code> (or SSL Port: 465)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">
                SMTP Username / Email
              </label>
              <input
                type="text"
                name="smtpUser"
                value={form.smtpUser}
                onChange={handleChange}
                placeholder="dsoftpack@gmail.com"
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">
                App Password / Password <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="smtpPass"
                  value={form.smtpPass}
                  onChange={handleChange}
                  placeholder="Enter 16-letter Gmail App Password"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-outline mt-1.5">
                For Gmail: Create a 16-letter password under Google Account &gt; Security &gt; App Passwords.
              </p>
            </div>
          </div>
        </div>

        {/* ── Test Email Dispatch Card ── */}
        <div className="bg-gradient-to-r from-sky-50/80 via-purple-50/50 to-sky-50/80 dark:from-slate-900 dark:to-slate-900 border border-sky-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-bold">
            <span className="material-symbols-outlined text-[22px]">send</span>
            <span>Test Your Email Setup</span>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            Enter an email address below and click <strong>Send Test Email</strong> to send a real test message and verify your SMTP credentials.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              type="email"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              placeholder="Enter target email (e.g. your personal email)"
              className="flex-1 bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={testing || !testEmailAddress}
              className="bg-slate-900 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">outgoing</span>
              {testing ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
