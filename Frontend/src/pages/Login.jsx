import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const targetRoute = user.role === 'ADMIN' ? '/admin' : '/';
      navigate(targetRoute, { replace: true });
    }
  }, [user, navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter both email and password.');
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    const toastId = toast.loading('Signing into your account...');

    const result = await login(form.email, form.password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.name || 'User'}!`, { id: toastId });
      const targetRoute = result.user.role === 'ADMIN' ? '/admin' : '/';
      navigate(targetRoute, { replace: true });
    } else {
      const errorMsg = result.error || 'Invalid credentials. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg, { id: toastId });
    }
  }

  return (
    <main className="w-full min-h-screen flex flex-col md:flex-row bg-surface-container-lowest text-on-surface">
      {/* ── Left Side: Authentication Form ── */}
      <section className="w-full md:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-16 relative overflow-hidden">
        {/* Top Header & Back Link */}
        <div className="flex items-center justify-between z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors bg-surface-container-low px-3.5 py-2 rounded-full border border-outline-variant/40 hover:border-primary/40 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Store
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Secure Portal
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-8 z-10 space-y-7">
          {/* Brand Header */}
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-sky-400 flex items-center justify-center text-white shadow-md shadow-primary/30">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <span className="text-xl font-black text-primary tracking-tight font-display">
                DSoft Pack
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-background tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Sign in to manage your digital software licenses, view order history, and access instant downloads.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-error/10 text-error rounded-2xl border border-error/20 text-xs font-semibold flex items-center gap-3 animate-shake">
              <span className="material-symbols-outlined text-xl shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. name@example.com"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold text-on-surface placeholder:text-outline/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-primary hover:underline hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  lock
                </span>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-2 flex items-center">
              <div className="flex-grow border-t border-outline-variant/40" />
              <span className="flex-shrink-0 mx-4 text-outline text-xs font-bold uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-outline-variant/40" />
            </div>

            {/* Guest Checkout Button */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-3 px-6 bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 text-on-surface font-bold text-xs sm:text-sm rounded-2xl transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              <span>Browse Products as Guest</span>
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="text-center pt-4 border-t border-outline-variant/30">
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="text-primary font-extrabold hover:underline inline-flex items-center gap-1 ml-1"
              >
                Create an Account <span className="material-symbols-outlined text-xs">chevron_right</span>
              </Link>
            </p>
          </div>
        </div>

        {/* Page Footer */}
        <div className="text-center text-[11px] text-outline z-10">
          © {new Date().getFullYear()} DSoft Pack. All rights reserved. Encrypted 256-bit Connection.
        </div>

        {/* Ambient Glow Effects */}
        <div className="absolute top-0 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      </section>

      {/* ── Right Side: Dynamic Image Canvas ── */}
      <section className="hidden md:flex md:w-1/2 min-h-screen relative overflow-hidden bg-slate-950">
        <img
          src="/dsoft_login_hero.png"
          alt="Digital IT Solutions Showcase"
          className="absolute inset-0 w-full h-full object-cover opacity-85 transition-transform duration-[12s] ease-out hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Feature Overlay Badges */}
        <div className="absolute inset-0 p-12 lg:p-16 flex flex-col justify-end text-white z-10 space-y-8">
          <div className="space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-sky-300">
              <span className="material-symbols-outlined text-[16px] text-sky-400">verified</span>
              Official Genuine Software Store
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
              Instant Access to Genuine Software Licenses
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Join thousands of satisfied Sri Lankan customers acquiring verified digital software keys with automated 15-minute delivery.
            </p>
          </div>

          {/* Value Props Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/15 max-w-lg">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 space-y-1">
              <span className="material-symbols-outlined text-amber-400 text-2xl">bolt</span>
              <h4 className="text-xs font-bold text-white">Instant Delivery</h4>
              <p className="text-[11px] text-slate-300">Automated key dispatch</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 space-y-1">
              <span className="material-symbols-outlined text-emerald-400 text-2xl">workspace_premium</span>
              <h4 className="text-xs font-bold text-white">100% Genuine</h4>
              <p className="text-[11px] text-slate-300">Direct activation</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 space-y-1">
              <span className="material-symbols-outlined text-sky-400 text-2xl">support_agent</span>
              <h4 className="text-xs font-bold text-white">Local Support</h4>
              <p className="text-[11px] text-slate-300">Asia/Colombo team</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
