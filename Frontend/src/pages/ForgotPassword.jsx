import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Sending reset link...');

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setSent(true);
        toast.success(data.message || 'Password reset link sent!', { id: toastId });
      } else {
        toast.error(data.error || 'Failed to request password reset', { id: toastId });
      }
    } catch (err) {
      console.error('Forgot password API error:', err);
      setLoading(false);
      toast.error('Server error. Please check your internet connection.', { id: toastId });
    }
  }

  return (
    <main className="flex-grow flex items-center justify-center px-4 py-16 bg-background text-on-background min-h-[75vh]">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors bg-surface-container-low px-3.5 py-2 rounded-full border border-outline-variant/40 hover:border-primary/40 shadow-xs mb-6"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Login
        </Link>

        <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xl border border-outline-variant/30 relative overflow-hidden">
          {sent ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-300 dark:border-emerald-800 shadow-sm">
                <span className="material-symbols-outlined text-4xl">mark_email_read</span>
              </div>
              <h1 className="text-2xl font-extrabold text-primary tracking-tight">Check Your Inbox</h1>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-medium max-w-sm mx-auto">
                We've sent a password reset link to <strong className="text-on-background">{email}</strong>. Please check your inbox and follow the instructions.
              </p>
              <div className="pt-4 border-t border-outline-variant/30 space-y-3">
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4"
                >
                  Didn't receive email? Try again
                </button>
                <div>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all shadow-md shadow-primary/20"
                  >
                    <span>Return to Login</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-2xl">lock_reset</span>
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-on-background tracking-tight">Forgot Password?</h1>
                  <p className="text-xs text-on-surface-variant font-medium">Reset your DSoft Pack account password</p>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                Enter your registered email address below and we'll send you an encrypted link to safely set up a new password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                      mail
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                      required
                      className="w-full bg-surface-container-low border border-outline-variant/60 rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold text-on-surface placeholder:text-outline/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
