import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Activation Support', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [currentTime, setCurrentTime] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [contactDetails, setContactDetails] = useState({
    companyEmail: 'dsoftpack@gmail.com',
    companyPhone: '+94 78 681 7659',
    whatsappNumber: '+94 78 681 7659',
    workingHours: '5:00 AM – 11:00 PM',
    facebookUrl: 'https://www.facebook.com/share/19BFB5mDyC/',
  });

  useEffect(() => {
    fetch(`${API_BASE}/settings`)
      .then((r) => r.json())
      .then((data) => {
        setContactDetails({
          companyEmail: data.companyEmail || 'dsoftpack@gmail.com',
          companyPhone: data.companyPhone || '+94 78 681 7659',
          whatsappNumber: data.whatsappNumber || '+94 78 681 7659',
          workingHours: data.workingHours || '5:00 AM – 11:00 PM',
          facebookUrl: data.facebookUrl || 'https://www.facebook.com/share/19BFB5mDyC/',
        });
      })
      .catch(() => {});

    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Colombo',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTime(timeStr);

      const colomboHourStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Colombo',
        hour: '2-digit',
        hour12: false,
      });
      const colomboHour = parseInt(colomboHourStr, 10);
      setIsOnline(colomboHour >= 5 && colomboHour < 23);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

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
        setForm({ name: '', email: '', subject: 'Activation Support', message: '' });
        toast.success('Your message has been sent successfully!', { id: toastId });
      } else {
        const errorMsg = data.error || 'Failed to send message. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg, { id: toastId });
      }
    } catch {
      const errorMsg = 'Network error. Please check your internet connection and try again.';
      setError(errorMsg);
      toast.error(errorMsg, { id: toastId });
    }
    setSubmitting(false);
  }

  return (
    <main className="flex-grow w-full max-w-[1400px] mx-auto px-5 md:px-16 py-6 md:py-10 text-on-background">
      {/* ── Page Header (Checkout/Cart Style) ── */}
      <header className="mb-6 text-center md:text-left border-b border-outline-variant/30 pb-3">
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background tracking-tight">
          Contact Us
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1">
          Have a question about software licenses, order activation, or technical support? We're here to help!
        </p>
      </header>

      {/* ── Quick Contact Information Cards ── */}
      <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Email Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-xs hover:shadow-ambient transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-primary flex items-center justify-center border border-sky-200 dark:border-sky-800">
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-on-surface">Email Support</h3>
              <p className="text-[11px] text-on-surface-variant">24/7 Digital Responses</p>
            </div>
          </div>
          <a
            href={`mailto:${contactDetails.companyEmail}`}
            className="text-xs sm:text-sm font-bold text-primary hover:underline break-all"
          >
            {contactDetails.companyEmail}
          </a>
        </div>

        {/* Phone & WhatsApp Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-xs hover:shadow-ambient transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <span className="material-symbols-outlined text-[20px]">call</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-on-surface">Phone & WhatsApp</h3>
              <p className="text-[11px] text-on-surface-variant">Direct Customer Line</p>
            </div>
          </div>
          <a
            href={`tel:${contactDetails.companyPhone.replace(/\s+/g, '')}`}
            className="text-xs sm:text-sm font-bold text-emerald-600 hover:underline"
          >
            {contactDetails.companyPhone}
          </a>
        </div>

        {/* Working Hours Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-xs hover:shadow-ambient transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center border border-orange-200 dark:border-orange-800">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-on-surface">Working Hours</h3>
              <p className="text-[11px] text-on-surface-variant">{contactDetails.workingHours}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant font-medium">GMT+5:30</span>
            <span className={`font-bold ${isOnline ? 'text-emerald-600' : 'text-amber-600'}`}>
              ● {isOnline ? 'Online Now' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Social Media Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-xs hover:shadow-ambient transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-on-surface">Facebook Page</h3>
              <p className="text-[11px] text-on-surface-variant">Follow & Message</p>
            </div>
          </div>
          <a
            href={contactDetails.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:underline"
          >
            @dsoftpack
          </a>
        </div>
      </section>

      {/* ── Main Content Grid (7 Cols Form / 5 Cols FAQ & Support Info) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Left Column (7 Cols): Contact Form Card */}
        <div className="lg:col-span-7">
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 space-y-6">
            <div className="border-b border-outline-variant/30 pb-3">
              <h2 className="text-xl md:text-2xl font-bold text-on-background inline-block relative pb-1">
                Send Us a Message
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-primary rounded-full" />
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Fill out the form below and our technical support team will get back to you as quickly as possible.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-10 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl p-6 space-y-3">
                <span className="material-symbols-outlined text-5xl text-emerald-600">
                  check_circle
                </span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
                  Thank you for reaching out to DSoft Pack. A copy of your inquiry has been logged and our team will respond to your email shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 bg-primary text-white font-bold text-xs py-2.5 px-6 rounded-full hover:bg-primary/90 transition-all duration-200 cursor-pointer shadow-xs"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-error-container/30 border border-error/20 rounded-lg text-xs">
                    <span className="material-symbols-outlined text-error text-[18px]">error</span>
                    <span className="font-medium text-on-error-container">{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="space-y-1">
                    <label htmlFor="name" className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                      Your Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Kasun Perera"
                      required
                      className="w-full bg-surface-container-low border border-neutral-300 dark:border-outline-variant/60 rounded-lg px-3.5 py-2.5 text-sm font-medium text-on-surface outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      required
                      className="w-full bg-surface-container-low border border-neutral-300 dark:border-outline-variant/60 rounded-lg px-3.5 py-2.5 text-sm font-medium text-on-surface outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Inquiry Category / Subject */}
                <div className="space-y-1">
                  <label htmlFor="subject" className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                    Inquiry Category *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface-container-low border border-neutral-300 dark:border-outline-variant/60 rounded-lg px-3.5 py-2.5 text-sm font-medium text-on-surface outline-none focus:border-primary transition-colors"
                  >
                    <option value="Activation Support">License Key Activation Issue</option>
                    <option value="CID Service Help">Microsoft CID Service Inquiry</option>
                    <option value="Order & Payment">Order Status & Payment Support</option>
                    <option value="Bulk Purchase">Bulk & Volume Licensing Inquiry</option>
                    <option value="General Question">General Inquiry</option>
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label htmlFor="message" className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                    Message Details *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Please describe your question or issue in detail (include error codes or order numbers if applicable)..."
                    required
                    rows={5}
                    className="w-full bg-surface-container-low border border-neutral-300 dark:border-outline-variant/60 rounded-lg px-3.5 py-2.5 text-sm font-medium text-on-surface outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-white font-bold text-sm py-3.5 px-8 rounded-full shadow-ambient hover:bg-primary/90 transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Inquiry</span>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column (5 Cols): Support FAQ & Guidelines */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Support Guidelines Card */}
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 space-y-4">
            <div className="border-b border-outline-variant/30 pb-2">
              <h3 className="text-lg font-bold text-on-background flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">verified</span>
                Activation Assistance Guidelines
              </h3>
            </div>
            
            <div className="space-y-3 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20">
                <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">timer</span>
                <div>
                  <strong className="text-slate-900 dark:text-white block font-bold">15-Minute Digital Delivery</strong>
                  Keys and order details are sent via email within 15 minutes during working hours; in rare cases, delivery may take longer.
                </div>
              </div>


              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20">
                <span className="material-symbols-outlined text-sky-600 text-[18px] shrink-0 mt-0.5">photo_camera</span>
                <div>
                  <strong className="text-slate-900 dark:text-white block font-bold">Screenshot for Faster Resolution</strong>
                  If you encounter an error during Windows or Office activation, attach a screenshot of the error code for rapid replacement.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20">
                <span className="material-symbols-outlined text-orange-500 text-[18px] shrink-0 mt-0.5">account_circle</span>
                <div>
                  <strong className="text-slate-900 dark:text-white block font-bold">Check Order History</strong>
                  You can view your purchased product keys anytime under <span className="font-bold text-primary">My Account &gt;&gt; Order History</span>.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Box */}
          <div className="bg-gradient-to-br from-primary/10 via-sky-50 dark:via-slate-900 to-orange-500/10 rounded-xl p-6 border border-primary/20 space-y-3 text-center">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Need Automated Phone Activation?
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Use our free 24/7 self-service Microsoft Confirmation ID (CID) generator tool without waiting for support.
            </p>
            <a
              href="/get-cid"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              Go to GetCID Service
            </a>
          </div>

        </div>

      </div>
    </main>
  );
}
