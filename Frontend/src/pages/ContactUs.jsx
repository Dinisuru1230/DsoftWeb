import { useState } from 'react';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  }

  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto px-5 md:px-16 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left — Info */}
        <div>
          <p className="font-label-md text-label-md text-primary uppercase tracking-widest mb-3">Get in Touch</p>
          <h1 className="font-display-lg-mobile md:font-headline-md text-display-lg-mobile md:text-headline-md text-on-surface mb-6">
            We'd Love to Hear From You
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 leading-relaxed">
            Have a question about an order, a custom request, or just want to say hello? We're here and happy to help.
          </p>

          {/* Contact Info Cards */}
          <div className="space-y-4 mb-10">
            {[
              { icon: 'mail', title: 'Email Us', info: 'hello@malmalee.lk', sub: 'We reply within 24 hours' },
              { icon: 'phone', title: 'Call Us', info: '+94 77 123 4567', sub: 'Mon–Sat, 9am–6pm' },
              { icon: 'location_on', title: 'Find Us', info: 'Colombo, Sri Lanka', sub: 'By appointment only' },
            ].map((c) => (
              <div key={c.icon} className="flex items-start gap-4 p-4 bg-surface-container-lowest rounded-xl shadow-ambient">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-[20px]">{c.icon}</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-primary">{c.title}</p>
                  <p className="font-body-md text-body-md text-on-surface">{c.info}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Feature image */}
          <div className="rounded-2xl overflow-hidden shadow-ambient">
            <img
              src="/08_flat_lay_fabrics_ribbon.jpg"
              alt="Malmalee Creations artisanal textures"
              className="w-full h-64 object-cover"
            />
          </div>
        </div>

        {/* Right — Form */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient">
          {submitted ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-primary mb-4 block">check_circle</span>
              <h2 className="font-headline-md-mobile text-headline-md-mobile text-primary mb-3">Message Sent!</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Thank you for reaching out. We'll get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 font-label-md text-label-md text-primary underline underline-offset-4 hover:text-on-primary-container transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="font-title-sm text-title-sm text-primary mb-6">Send a Message</h2>
              {[
                { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name' },
                { name: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
                { name: 'subject', label: 'Subject', type: 'text', placeholder: 'What is this about?' },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="font-label-md text-label-md text-on-surface mb-1 block">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required
                    className="custom-input w-full py-3 font-body-md text-body-md text-on-surface placeholder:text-outline bg-transparent"
                  />
                </div>
              ))}
              <div>
                <label className="font-label-md text-label-md text-on-surface mb-1 block">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  required
                  rows={5}
                  className="w-full border-b-2 border-outline-variant focus:border-primary outline-none px-0 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline bg-transparent transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 px-8 bg-primary-container text-on-background font-label-md text-label-md rounded-full hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                Send Message
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
