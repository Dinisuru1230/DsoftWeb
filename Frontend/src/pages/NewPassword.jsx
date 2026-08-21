import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewPassword() {
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (form.password === form.confirm && form.password.length >= 6) {
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    }
  }

  return (
    <main className="flex-grow flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient">
          {done ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-6xl text-primary mb-4 block">lock_open</span>
              <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary mb-3">Password Updated!</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Redirecting you to login...</p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary">lock</span>
              </div>
              <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary mb-2">Set New Password</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8">
                Your new password must be at least 6 characters.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  { name: 'password', label: 'New Password', placeholder: 'Enter new password' },
                  { name: 'confirm', label: 'Confirm Password', placeholder: 'Repeat new password' },
                ].map(({ name, label, placeholder }) => (
                  <div key={name}>
                    <label className="font-label-md text-label-md text-on-surface mb-1 block">{label}</label>
                    <input
                      type="password" name={name} value={form[name]}
                      onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
                      placeholder={placeholder} required minLength={6}
                      className="custom-input w-full py-3 font-body-md text-body-md text-on-surface bg-transparent"
                    />
                  </div>
                ))}
                <button type="submit" className="w-full py-3 px-8 bg-primary-container text-on-primary-fixed font-label-md text-label-md rounded-lg shadow-ambient hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center gap-2">
                  Update Password
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
