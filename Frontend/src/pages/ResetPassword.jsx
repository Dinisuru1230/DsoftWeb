import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error('Please fill in both password fields.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match. Please check again.');
      return;
    }

    if (!token) {
      toast.error('Invalid or missing password reset token.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Resetting password...');

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        toast.success(data.message || 'Password reset successfully!', { id: toastId });
        navigate('/login');
      } else {
        toast.error(data.error || 'Failed to reset password', { id: toastId });
      }
    } catch (err) {
      console.error('Reset password API error:', err);
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
          {!token ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto border border-red-300 dark:border-red-800 shadow-sm">
                <span className="material-symbols-outlined text-4xl">key_off</span>
              </div>
              <h1 className="text-xl font-extrabold text-on-background tracking-tight">Invalid Reset Link</h1>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-medium">
                This password reset link is invalid or missing a security token. Please request a new link.
              </p>
              <div className="pt-4 border-t border-outline-variant/30">
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all shadow-md shadow-primary/20"
                >
                  <span>Request Reset Link</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-2xl">key</span>
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-on-background tracking-tight">Set New Password</h1>
                  <p className="text-xs text-on-surface-variant font-medium">Create a new secure password</p>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                Enter your new password below to update your DSoft Pack account credentials.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                      lock
                    </span>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                      className="w-full bg-surface-container-low border border-outline-variant/60 rounded-2xl pl-11 pr-11 py-3 text-sm font-semibold text-on-surface placeholder:text-outline/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary p-1 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPass ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                      lock_reset
                    </span>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      minLength={6}
                      className="w-full bg-surface-container-low border border-outline-variant/60 rounded-2xl pl-11 pr-11 py-3 text-sm font-semibold text-on-surface placeholder:text-outline/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
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
