import { useState } from 'react';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const toastId = toast.loading('Sending your message...');

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setForm({ name: '', email: '', subject: '', message: '' });
        toast.success('Your message has been sent to our team!', { id: toastId });
      } else {
        const errorMsg = data.error || 'Failed to send message. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg, { id: toastId });
      }
    } catch {
      const errorMsg = 'Network error. Please check your connection and try again.';
      setError(errorMsg);
      toast.error(errorMsg, { id: toastId });
    }
    setSubmitting(false);
  }


  return (
    <main className="flex-grow flex flex-col md:flex-row w-full min-h-[calc(100vh-140px)]">
      {/* Left Side: 50% High-Res Image Canvas */}
      <div className="w-full md:w-1/2 min-h-[400px] md:min-h-full relative overflow-hidden bg-surface-container">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url('/20_flat_lay_ribbon_jasmine.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
      </div>

      {/* Right Side: Contact Form & Details */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-surface-container-lowest">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center md:text-left">
            <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-surface">
              Get in Touch
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              We'd love to hear from you. Whether you have a question about our handmade collections or just want to say hello.
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-12 bg-surface-container-low rounded-xl p-8 space-y-3 shadow-ambient">
              <span className="material-symbols-outlined text-5xl text-primary block">check_circle</span>
              <h2 className="font-title-sm text-title-sm text-primary">Message Sent!</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Thank you for reaching out. We will respond within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 font-label-md text-label-md text-primary underline underline-offset-4"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-error-container/30 rounded-lg text-sm">
                  <span className="material-symbols-outlined text-error text-[18px]">error</span>
                  <span className="font-body-md text-on-error-container">{error}</span>
                </div>
              )}
              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your beautiful name"
                  required
                  className="custom-input w-full px-0 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline bg-transparent"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Where can we reach you?"
                  required
                  className="custom-input w-full px-0 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline bg-transparent"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider" htmlFor="subject">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="What is this regarding?"
                  required
                  className="custom-input w-full px-0 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline bg-transparent"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  required
                  rows={4}
                  className="custom-input w-full px-0 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline bg-transparent resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-container text-on-primary-fixed font-label-md text-label-md py-3 px-8 rounded-lg shadow-ambient hover:shadow-ambient-lg hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Contact Details Footer Grid */}
          <div className="pt-8 border-t border-outline-variant/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <span className="material-symbols-outlined text-primary mt-0.5">mail</span>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Email</p>
                <a href="mailto:hello@malmalee.lk" className="font-body-md text-body-md text-primary hover:underline">
                  hello@malmalee.lk
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="material-symbols-outlined text-primary mt-0.5">call</span>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Phone</p>
                <a href="tel:+94771234567" className="font-body-md text-body-md text-primary hover:underline">
                  +94 77 123 4567
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:col-span-2">
              <span className="material-symbols-outlined text-primary mt-0.5">photo_camera</span>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Facebook</p>
                <a href="#" className="font-body-md text-body-md text-primary hover:underline">
                  @malmaleecreations
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
