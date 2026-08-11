import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AccountSidebar from '../components/AccountSidebar';

export default function MyProfile() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    firstName: user?.firstName || 'Amara',
    lastName: user?.lastName || 'Perera',
    email: user?.email || 'amara@malmalee.lk',
    phone: user?.phone || '+94 77 123 4567',
    address: user?.address || '42 Flower Lane',
    city: user?.city || 'Colombo 03',
    state: user?.state || 'Western Province',
    postalCode: user?.postalCode || '00300',
    country: user?.country || 'Sri Lanka',
  });

  const [saved, setSaved] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    updateUser({ ...form, name: `${form.firstName} ${form.lastName}` });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <main className="flex-grow flex flex-col md:flex-row w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 py-12 gap-8">
      {/* Unified Account Sidebar */}
      <AccountSidebar />

      {/* Main Content Area */}
      <section className="flex-grow max-w-3xl">
        <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-background mb-6">
          Profile Settings
        </h1>

        <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-6 md:p-10 rounded-xl shadow-ambient border border-outline-variant/30 flex flex-col gap-8">
          {/* Personal Details */}
          <div className="flex flex-col gap-4">
            <div className="border-b border-outline-variant/40 pb-2">
              <h3 className="font-title-sm text-title-sm text-primary">Personal Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="custom-input w-full py-2 font-body-md text-body-md text-on-surface bg-transparent"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="custom-input w-full py-2 font-body-md text-body-md text-on-surface bg-transparent"
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="custom-input w-full py-2 font-body-md text-body-md text-on-surface bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-4">
            <div className="border-b border-outline-variant/40 pb-2">
              <h3 className="font-title-sm text-title-sm text-primary">Contact Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="custom-input w-full py-2 font-body-md text-body-md text-on-surface bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="flex flex-col gap-4">
            <div className="border-b border-outline-variant/40 pb-2">
              <h3 className="font-title-sm text-title-sm text-primary">Delivery Address</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="custom-input w-full py-2 font-body-md text-body-md text-on-surface bg-transparent"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="custom-input w-full py-2 font-body-md text-body-md text-on-surface bg-transparent"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                  State / Province
                </label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className="custom-input w-full py-2 font-body-md text-body-md text-on-surface bg-transparent"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  required
                  className="custom-input w-full py-2 font-body-md text-body-md text-on-surface bg-transparent"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                  className="custom-input w-full py-2 font-body-md text-body-md text-on-surface bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4 border-t border-outline-variant/40">
            <button
              type="submit"
              className={`py-3 px-8 font-label-md text-label-md rounded-lg shadow-ambient hover:shadow-ambient-lg transition-all duration-300 flex items-center gap-2 ${
                saved ? 'bg-primary text-white' : 'bg-primary-container text-on-primary-fixed hover:bg-primary hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{saved ? 'check' : 'save'}</span>
              {saved ? 'Changes Saved!' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
