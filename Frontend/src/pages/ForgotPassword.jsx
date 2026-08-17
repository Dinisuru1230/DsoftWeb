import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <main className="flex-grow flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <Link to="/login" className="flex items-center gap-1 font-label-md text-label-md text-primary mb-8 hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Login
        </Link>
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient">
          {sent ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-6xl text-primary mb-4 block">mark_email_read</span>
              <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary mb-3">Check Your Email</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
              </p>
              <Link to="/login" className="font-label-md text-label-md text-primary underline underline-offset-4">
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary">lock_reset</span>
              </div>
              <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary mb-2">Forgot Password?</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8">
                No worries! Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="font-label-md text-label-md text-on-surface mb-1 block">Email Address</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" required
                    className="custom-input w-full py-3 font-body-md text-body-md text-on-surface placeholder:text-outline bg-transparent"
                  />
                </div>
                <button type="submit" className="w-full py-3 px-8 bg-primary-container text-on-primary-fixed font-label-md text-label-md rounded-lg shadow-ambient hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center gap-2">
                  Send Reset Link
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
