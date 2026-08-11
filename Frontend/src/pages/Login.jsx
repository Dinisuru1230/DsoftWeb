import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
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
    // Demo login — connect to real API later
    if (form.email && form.password.length >= 6) {
      login({ name: 'Malmalee User', email: form.email }, 'demo-token-123');
      navigate('/account');
    } else {
      setError('Please check your email and password (min 6 characters).');
    }
  }

  return (
    <main className="flex-grow flex min-h-[calc(100vh-80px)]">
      {/* Left — Form */}
      <section className="flex-1 flex items-center justify-center px-5 md:px-16 py-16">
        <div className="w-full max-w-md relative">
          {/* Decorative blob */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-container/30 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative z-10">
            <Link to="/" className="font-display-lg-mobile text-display-lg-mobile text-primary tracking-tight block mb-6">
              Malmalee Creations
            </Link>
            <h1 className="font-headline-md-mobile text-headline-md-mobile text-on-surface mb-1">Welcome back</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8">Please enter your details to sign in.</p>

            {error && (
              <div className="mb-4 p-3 bg-error-container rounded-lg">
                <p className="font-body-md text-body-md text-error">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="font-label-md text-label-md text-on-surface mb-1 block" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="custom-input w-full py-3 font-body-md text-body-md text-on-surface placeholder:text-outline bg-transparent"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-label-sm text-label-sm text-primary hover:text-on-primary-container transition-colors"
                  >
                    Forgot Password?
                  </Link>
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
                    className="custom-input w-full py-3 pr-10 font-body-md text-body-md text-on-surface placeholder:text-outline bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-primary hover:text-on-primary-container"
                  >
                    <span className="material-symbols-outlined">
                      {showPass ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-8 bg-primary-container text-on-primary-fixed font-label-md text-label-md rounded-lg shadow-ambient hover:shadow-ambient-lg hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center gap-2"
                >
                  Sign In
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-outline-variant" />
                <span className="mx-4 text-on-surface-variant font-label-sm text-label-sm">or</span>
                <div className="flex-grow border-t border-outline-variant" />
              </div>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-3 px-8 bg-transparent border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors flex justify-center items-center gap-2"
              >
                Continue as Guest
              </button>
            </form>

            <div className="text-center pt-8">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-label-md text-label-md text-primary underline underline-offset-4 hover:text-on-primary-container transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Right — Image Panel */}
      <section className="hidden md:flex md:w-1/2 h-full relative overflow-hidden">
        <img
          src="/13_studio_table_ribbons.jpg"
          alt="Handmade boutique artisanal textures"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center p-16">
          <div className="text-center space-y-3">
            <h2 className="font-display-lg text-white text-headline-md drop-shadow-md">Artisanal Elegance</h2>
            <p className="font-body-md text-white text-body-md drop-shadow-sm">Crafted with love, for your every day.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
