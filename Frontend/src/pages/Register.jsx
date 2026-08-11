import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    login({ name: form.name, email: form.email }, 'demo-token-new');
    navigate('/account');
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
      <section className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 md:p-16 bg-surface-container-lowest">
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* Header */}
          <div className="text-center md:text-left flex flex-col gap-2">
            <Link to="/" className="inline-block mb-2">
              <span className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary tracking-tight">
                Malmalee Creations
              </span>
            </Link>
            <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-background">
              Create an Account
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Step into a world of everyday magic and handmade elegance.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-error-container rounded-lg">
              <p className="font-body-md text-body-md text-error">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">
                  person
                </span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  required
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant text-on-background focus:outline-none focus:border-primary py-3 pl-10 pr-2 font-body-md text-body-md transition-colors placeholder:text-outline/50 bg-transparent rounded-t-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">
                  mail
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  required
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant text-on-background focus:outline-none focus:border-primary py-3 pl-10 pr-2 font-body-md text-body-md transition-colors placeholder:text-outline/50 bg-transparent rounded-t-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">
                  lock
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant text-on-background focus:outline-none focus:border-primary py-3 pl-10 pr-10 font-body-md text-body-md transition-colors placeholder:text-outline/50 bg-transparent rounded-t-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPass ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">
                  lock_reset
                </span>
                <input
                  type="password"
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  required
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant text-on-background focus:outline-none focus:border-primary py-3 pl-10 pr-2 font-body-md text-body-md transition-colors placeholder:text-outline/50 bg-transparent rounded-t-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-2 w-full bg-primary-container text-on-primary-container font-label-md text-label-md py-3 px-8 rounded-lg hover:shadow-ambient hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Create Account</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          {/* Footer / Login Link */}
          <div className="text-center mt-2 pt-4 border-t border-outline-variant/30">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Already a member?{' '}
              <Link
                to="/login"
                className="text-primary font-medium hover:text-tertiary transition-colors underline underline-offset-4"
              >
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
