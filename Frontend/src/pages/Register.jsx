import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, register } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  // Handle Sri Lanka phone number input (9 digits only after +94)
  function handlePhoneChange(e) {
    let val = e.target.value;
    // Strip everything except digits
    val = val.replace(/\D/g, '');
    // If user starts typing with 0 (e.g. 077...), trim leading 0
    if (val.startsWith('0')) {
      val = val.substring(1);
    }
    // Limit to exactly 9 digits
    if (val.length > 9) {
      val = val.substring(0, 9);
    }
    setForm({ ...form, phone: val });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // 1. Full Name check
    if (!form.name || form.name.trim().length < 2) {
      toast.error('Please enter a valid full name (at least 2 characters).');
      setError('Please enter a valid full name (at least 2 characters).');
      return;
    }

    // 2. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email address.');
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    // 3. Sri Lankan Contact number validation (must be exactly 9 digits if provided)
    if (form.phone && form.phone.length !== 9) {
      toast.error('Contact number must contain exactly 9 digits after +94.');
      setError('Contact number must contain exactly 9 digits after +94 (e.g. +94 77 123 4567).');
      return;
    }

    // 4. Password length validation
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      setError('Password must be at least 6 characters long.');
      return;
    }

    // 5. Password match check
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match.');
      setError('Passwords do not match. Please check and try again.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    const toastId = toast.loading('Creating your account...');

    const formattedPhone = form.phone ? `+94${form.phone}` : '';

    const result = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: formattedPhone,
      address: form.address,
      city: form.city,
      district: form.district,
      postalCode: form.postalCode,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Welcome to DSoft Pack, ${result.user.name || 'Friend'}!`, { id: toastId });
      if (result.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      const errorMsg = result.error || 'Registration failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg, { id: toastId });
    }
  }

  return (
    <main className="w-full min-h-screen flex flex-col lg:flex-row bg-surface-container-lowest text-on-surface">
      {/* ── Left Side: Dreamy Image Canvas ── */}
      <section className="hidden lg:flex lg:w-5/12 min-h-screen relative overflow-hidden bg-slate-950">
        <img
          src="/dsoft_register_hero.png"
          alt="Digital License Delivery Showcase"
          className="absolute inset-0 w-full h-full object-cover opacity-85 transition-transform duration-[12s] ease-out hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Feature Overlay Badges */}
        <div className="absolute inset-0 p-12 flex flex-col justify-between text-white z-10">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-white/90 hover:text-white transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Store
            </Link>
          </div>

          <div className="space-y-6 max-w-md">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 backdrop-blur-md border border-purple-400/30 text-xs font-bold text-purple-200">
              <span className="material-symbols-outlined text-[16px] text-purple-300">auto_awesome</span>
              Join DSoft Pack Community
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
              Create Your Digital License Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Enjoy seamless license management, instant email dispatch upon payment confirmation, and dedicated technical assistance.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/15">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-2xl font-black text-white">5,000+</div>
                <div className="text-xs text-slate-300 font-medium">Active Sri Lanka Users</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-2xl font-black text-white">99.9%</div>
                <div className="text-xs text-slate-300 font-medium">License Delivery Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Right Side: Registration Form ── */}
      <section className="w-full lg:w-7/12 min-h-screen flex flex-col justify-between p-6 sm:p-10 md:p-14 relative overflow-y-auto">
        {/* Mobile Header Link */}
        <div className="flex lg:hidden items-center justify-between z-10 mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors bg-surface-container-low px-3.5 py-2 rounded-full border border-outline-variant/40 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Store
          </Link>
        </div>

        <div className="w-full max-w-xl mx-auto my-auto py-6 space-y-6 z-10">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white shadow-md shadow-primary/30">
                <span className="material-symbols-outlined text-2xl">person_add</span>
              </div>
              <span className="text-xl font-black text-primary tracking-tight font-display">
                DSoft Pack
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-background tracking-tight">
              Create Customer Account
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Register now to unlock digital license tracking, instant key delivery, and order management.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-error/10 text-error rounded-2xl border border-error/20 text-xs font-semibold flex items-center gap-3 animate-shake">
              <span className="material-symbols-outlined text-xl shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Grid Layout for Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                  Full Name <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                    person
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Kasun Perera"
                    required
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold text-on-surface placeholder:text-outline/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                  Email Address <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                    email
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="kasun@example.com"
                    required
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold text-on-surface placeholder:text-outline/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Sri Lanka Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                  Mobile Number (Sri Lanka)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-2.5 z-10 flex items-center gap-1 bg-surface-container px-2 py-1 rounded-xl text-on-surface font-mono font-bold text-xs border border-outline-variant/40 select-none">
                    <span>+94</span>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handlePhoneChange}
                    placeholder="77 123 4567"
                    maxLength={9}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-2xl pl-16 pr-4 py-3 text-sm font-semibold font-mono text-on-surface placeholder:text-outline/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <p className="text-[11px] text-outline">
                  {form.phone ? `Full: +94 ${form.phone}` : 'Enter 9 digits after +94'}
                </p>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                  Password <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                    lock
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
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
                <p className={`text-[11px] ${form.password && form.password.length < 6 ? 'text-error font-medium' : 'text-outline'}`}>
                  At least 6 characters. {form.password ? `(${form.password.length}/6)` : ''}
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                  Confirm Password <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                    lock_reset
                  </span>
                  <input
                    type="password"
                    name="confirm"
                    value={form.confirm}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-2xl pl-11 pr-11 py-3 text-sm font-semibold text-on-surface placeholder:text-outline/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  {form.confirm && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {form.password === form.confirm ? (
                        <span className="material-symbols-outlined text-emerald-500 text-[20px]">check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined text-error text-[20px]">cancel</span>
                      )}
                    </span>
                  )}
                </div>
                {form.confirm && form.password !== form.confirm && (
                  <p className="text-[11px] text-error font-medium">Passwords do not match</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  <span>Creating Your Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Text */}
          <div className="text-center pt-4 border-t border-outline-variant/30">
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary font-extrabold hover:underline inline-flex items-center gap-1 ml-1"
              >
                Sign In Instead <span className="material-symbols-outlined text-xs">chevron_right</span>
              </Link>
            </p>
          </div>
        </div>

        {/* Page Footer */}
        <div className="text-center text-[11px] text-outline z-10 pt-4">
          By registering, you agree to DSoft Pack terms of service &amp; privacy policy.
        </div>

        {/* Background Ambient Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      </section>
    </main>
  );
}
