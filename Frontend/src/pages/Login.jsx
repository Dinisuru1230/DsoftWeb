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

  // If already logged in when visiting /login directly, redirect on mount
  useEffect(() => {
    if (user) {
      const targetRoute = user.role === 'ADMIN' ? '/admin' : '/';
      navigate(targetRoute, { replace: true });
    }
  }, []); // Empty dependency array prevents double-navigation during form submission!

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
    <main className="w-full min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Side: Authentication Form */}
      <section className="w-full md:w-1/2 min-h-screen flex flex-col justify-center items-center px-6 md:px-16 py-12 bg-surface-container-lowest relative">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-block">
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary tracking-tight">
                Malmalee Creations
              </h1>
            </Link>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Welcome back. Sign in to your account.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-error-container text-on-error-container rounded-lg border border-error/30 text-center text-sm font-label-md">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface block" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. customer@example.com or admin@malmalee.lk"
                required
                className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary outline-none py-3 font-body-md text-on-surface transition-colors"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary outline-none py-3 pr-10 font-body-md text-on-surface transition-colors"
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
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-8 bg-primary-container text-on-background font-label-md text-label-md rounded-full shadow-ambient hover:bg-primary hover:text-white transition-all duration-300 flex justify-center items-center gap-2 font-bold cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative py-2 flex items-center">
              <div className="flex-grow border-t border-outline-variant" />
              <span className="flex-shrink-0 mx-4 text-on-surface-variant font-label-sm text-label-sm">or</span>
              <div className="flex-grow border-t border-outline-variant" />
            </div>

            <div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-3 px-8 bg-transparent border border-outline-variant text-on-surface font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors duration-300 flex justify-center items-center gap-2 cursor-pointer"
              >
                Continue as Guest
              </button>
            </div>
          </form>

          {/* Footer text */}
          <div className="text-center pt-4 border-t border-outline-variant/30">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-label-md text-label-md text-primary font-bold hover:underline transition-colors"
              >
                Create Account (Sign Up)
              </Link>
            </p>
          </div>
        </div>

        {/* Floating Decorative Element */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-container/30 rounded-full blur-[60px] pointer-events-none" />
      </section>

      {/* Right Side: Image Canvas */}
      <section className="hidden md:flex md:w-1/2 min-h-screen relative overflow-hidden">
        <img
          src="/13_studio_table_ribbons.jpg"
          alt="Handmade boutique artisanal textures"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center p-12">
          <div className="text-center space-y-3">
            <h2 className="font-display-lg text-white text-display-lg-mobile md:text-headline-md drop-shadow-md">
              Artisanal Elegance
            </h2>
            <p className="font-body-md text-white text-body-md drop-shadow-sm">
              Crafted with love, for your home.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
