import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function MyProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postalCode || '',
  });
  const [saved, setSaved] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto px-5 md:px-16 py-16">
      <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary mb-8">
        My Profile
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar Card */}
        <div className="lg:col-span-1">
          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient text-center">
            <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-5xl">person</span>
            </div>
            <h2 className="font-title-sm text-title-sm text-on-surface mb-1">{form.name || 'Your Name'}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">{form.email}</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient space-y-6">
            <h2 className="font-title-sm text-title-sm text-primary">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { name: 'name', label: 'Full Name' },
                { name: 'email', label: 'Email Address', type: 'email' },
                { name: 'phone', label: 'Phone Number', type: 'tel' },
              ].map(({ name, label, type = 'text' }) => (
                <div key={name}>
                  <label className="font-label-md text-label-md text-on-surface mb-1 block">{label}</label>
                  <input
                    type={type} name={name} value={form[name]} onChange={handleChange}
                    className="custom-input w-full py-3 font-body-md text-body-md text-on-surface bg-transparent"
                  />
                </div>
              ))}
            </div>

            <h2 className="font-title-sm text-title-sm text-primary pt-4 border-t border-outline-variant">Delivery Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { name: 'address', label: 'Street Address' },
                { name: 'city', label: 'City' },
                { name: 'postalCode', label: 'Postal Code' },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className="font-label-md text-label-md text-on-surface mb-1 block">{label}</label>
                  <input
                    name={name} value={form[name]} onChange={handleChange}
                    className="custom-input w-full py-3 font-body-md text-body-md text-on-surface bg-transparent"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                className={`py-3 px-8 font-label-md text-label-md rounded-full transition-all duration-300 flex items-center gap-2 ${
                  saved
                    ? 'bg-primary text-white'
                    : 'bg-primary-container text-on-background hover:bg-primary hover:text-white shadow-ambient'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{saved ? 'check' : 'save'}</span>
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
