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
    <main className="flex-grow flex min-h-[calc(100vh-80px)]">
      {/* Left — Form */}
      <section className="flex-1 flex items-center justify-center px-5 md:px-16 py-16">
        <div className="w-full max-w-md relative">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-container/30 rounded-full blur-[60px] pointer-events-none" />
          <div className="relative z-10">
            <Link to="/" className="font-display-lg-mobile text-display-lg-mobile text-primary tracking-tight block mb-6">
              Malmalee Creations
            </Link>
            <h1 className="font-headline-md-mobile text-headline-md-mobile text-on-surface mb-1">Join the Magic</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8">
              Create your account and enjoy exclusive access to our collections.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-error-container rounded-lg">
                <p className="font-body-md text-body-md text-error">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
                { name: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="font-label-md text-label-md text-on-surface mb-1 block">{label}</label>
                  <input
                    type={type} name={name} value={form[name]} onChange={handleChange}
                    placeholder={placeholder} required
                    className="custom-input w-full py-3 font-body-md text-body-md text-on-surface placeholder:text-outline bg-transparent"
                  />
                </div>
              ))}
              <div>
                <label className="font-label-md text-label-md text-on-surface mb-1 block">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                    placeholder="Create a password" required
                    className="custom-input w-full py-3 pr-10 font-body-md text-body-md text-on-surface bg-transparent"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-0 top-1/2 -translate-y-1/2 text-primary">
                    <span className="material-symbols-outlined">{showPass ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface mb-1 block">Confirm Password</label>
                <input
                  type="password" name="confirm" value={form.confirm} onChange={handleChange}
                  placeholder="Repeat your password" required
                  className="custom-input w-full py-3 font-body-md text-body-md text-on-surface bg-transparent"
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-3 px-8 bg-primary-container text-on-primary-fixed font-label-md text-label-md rounded-lg shadow-ambient hover:shadow-ambient-lg hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center gap-2">
                  Create Account
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </form>

            <div className="text-center pt-8">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Already have an account?{' '}
                <Link to="/login" className="font-label-md text-label-md text-primary underline underline-offset-4 hover:text-on-primary-container transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Right — Image */}
      <section className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <img src="/10_airy_artisanal_studio.jpg" alt="Airy artisanal studio" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center p-16">
          <div className="text-center space-y-3">
            <h2 className="font-display-lg text-white text-headline-md drop-shadow-md">Your Everyday Magic Awaits</h2>
            <p className="font-body-md text-white text-body-md drop-shadow-sm">Handcrafted for the moments that matter.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
