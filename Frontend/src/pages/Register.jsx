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

  // If already logged in, redirect automatically
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
    <main className="w-full min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Side: Dreamy Image Canvas (Hidden on mobile) */}
      <section className="hidden lg:flex lg:w-1/2 min-h-screen relative overflow-hidden bg-surface-container">
        <img
          src="/10_airy_artisanal_studio.jpg"
          alt="Airy artisanal studio"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-in-out hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center p-12">
          <div className="text-center space-y-3">
            <h2 className="font-display-lg text-white text-headline-md drop-shadow-md">
              Your Everyday Magic Awaits
            </h2>
            <p className="font-body-md text-white text-body-md drop-shadow-sm">
              Handcrafted for the moments that matter.
            </p>
          </div>
        </div>
      </section>

      {/* Right Side: Registration Form */}
      <section className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 md:p-12 bg-surface-container-lowest overflow-y-auto">
        <div className="w-full max-w-md flex flex-col gap-6 py-8">
          {/* Header */}
          <div className="text-center md:text-left flex flex-col gap-1">
            <Link to="/" className="inline-block mb-1">
              <span className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary tracking-tight">
                DSoft Pack
              </span>
            </Link>
            <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-background">
              Create a Customer Account
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Step into a world of everyday magic and handmade elegance.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-error-container text-on-error-container rounded-lg border border-error/30 text-sm font-label-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Amara Perera"
                required
                className="w-full bg-surface-container-low border-b-2 border-outline-variant text-on-background focus:outline-none focus:border-primary py-2.5 font-body-md transition-colors placeholder:text-outline/50 bg-transparent"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="amara@example.com"
                required
                className="w-full bg-surface-container-low border-b-2 border-outline-variant text-on-background focus:outline-none focus:border-primary py-2.5 font-body-md transition-colors placeholder:text-outline/50 bg-transparent"
              />
            </div>

            {/* Contact Number with Sri Lanka +94 Prefix & 9-digit restriction */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Contact Number (Sri Lanka)
              </label>
              <div className="flex items-center gap-2 bg-surface-container-low border-b-2 border-outline-variant focus-within:border-primary transition-colors py-1.5">
                <div className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded text-on-surface font-mono font-bold text-xs border border-outline-variant/40 select-none">
                  <span>+94</span>
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  placeholder="77 123 4567"
                  maxLength={9}
                  className="w-full bg-transparent text-on-background focus:outline-none py-1 font-body-md placeholder:text-outline/50 tracking-wider font-mono"
                />
              </div>
              <p className="text-[11px] text-on-surface-variant/70">
                Enter your 9-digit mobile number. {form.phone ? `Full: +94 ${form.phone}` : '(e.g. 771234567)'}
              </p>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Delivery Address
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="42 Flower Lane, Colombo 03"
                className="w-full bg-surface-container-low border-b-2 border-outline-variant text-on-background focus:outline-none focus:border-primary py-2.5 font-body-md transition-colors placeholder:text-outline/50 bg-transparent"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant text-on-background focus:outline-none focus:border-primary py-2.5 pr-10 font-body-md transition-colors placeholder:text-outline/50 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-primary hover:text-on-primary-container p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPass ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              <p className={`text-[11px] ${form.password && form.password.length < 6 ? 'text-error' : 'text-on-surface-variant/70'}`}>
                Must be at least 6 characters. {form.password ? `(${form.password.length}/6)` : ''}
              </p>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant text-on-background focus:outline-none focus:border-primary py-2.5 pr-8 font-body-md transition-colors placeholder:text-outline/50 bg-transparent"
                />
                {form.confirm && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 p-1">
                    {form.password === form.confirm ? (
                      <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
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

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-8 bg-primary-container text-on-background font-label-md text-label-md rounded-full shadow-ambient hover:bg-primary hover:text-white transition-all duration-300 flex justify-center items-center gap-2 mt-2 font-bold cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Text */}
          <div className="text-center pt-3 border-t border-outline-variant/30">
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-label-md text-label-md text-primary font-bold hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
