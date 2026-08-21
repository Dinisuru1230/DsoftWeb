import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AccountSidebar from '../components/AccountSidebar';
import {
  SRI_LANKA_PROVINCES,
  SRI_LANKA_CITIES_BY_PROVINCE,
  ALL_SRI_LANKA_CITIES,
} from '../data/sriLankaLocationData';

export default function MyProfile() {
  const { user, updateUser, changePassword } = useAuth();

  const [form, setForm] = useState({
    firstName: user?.name ? user.name.split(' ')[0] : '',
    lastName: user?.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : '',
    email: user?.email || '',
    phone: (user?.phone || '').replace('+94', '').replace(/\s/g, ''),
    address: user?.address || '',
    city: user?.city || 'Colombo 03',
    state: user?.district || 'Western Province',
    postalCode: user?.postalCode || '',
    country: 'Sri Lanka',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState(false);

  const [passErrors, setPassErrors] = useState({});
  const [passFormError, setPassFormError] = useState('');
  const [savingPass, setSavingPass] = useState(false);
  const [passSaved, setPassSaved] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.name ? user.name.split(' ')[0] : '',
        lastName: user.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : '',
        email: user.email || '',
        phone: (user.phone || '').replace('+94', '').replace(/\s/g, ''),
        address: user.address || '',
        city: user.city || 'Colombo 03',
        state: user.district || 'Western Province',
        postalCode: user.postalCode || '',
        country: 'Sri Lanka',
      });
    }
  }, [user]);

  const availableCities = SRI_LANKA_CITIES_BY_PROVINCE[form.state] || ALL_SRI_LANKA_CITIES;

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'phone') {
      let val = value.replace(/\D/g, '');
      if (val.startsWith('0')) val = val.substring(1);
      if (val.length > 9) val = val.substring(0, 9);
      setForm((prev) => ({ ...prev, phone: val }));
    } else if (name === 'postalCode') {
      let val = value.replace(/\D/g, '');
      if (val.length > 5) val = val.substring(0, 5);
      setForm((prev) => ({ ...prev, postalCode: val }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setFormError('');
    setSaved(false);
  }

  function handlePassChange(e) {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setPassErrors((prev) => ({ ...prev, [name]: '' }));
    setPassFormError('');
    setPassSaved(false);
  }

  function handleStateChange(e) {
    const newState = e.target.value;
    const citiesForState = SRI_LANKA_CITIES_BY_PROVINCE[newState] || ALL_SRI_LANKA_CITIES;
    const newCity = citiesForState.includes(form.city) ? form.city : citiesForState[0];
    setForm((prev) => ({
      ...prev,
      state: newState,
      city: newCity,
    }));
    setSaved(false);
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};

    if (!form.firstName || form.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters.';
    }
    if (!form.lastName || form.lastName.trim().length < 1) {
      newErrors.lastName = 'Last name is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email.trim())) {
      newErrors.email = 'Valid email address is required.';
    }
    if (form.phone && form.phone.length !== 9) {
      newErrors.phone = 'Phone number must be exactly 9 digits (e.g. 77 123 4567).';
    }
    if (form.postalCode && form.postalCode.length !== 5) {
      newErrors.postalCode = 'Postal code must be exactly 5 digits (e.g. 10350).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the highlighted errors before saving.');
      return;
    }

    const toastId = toast.loading('Saving your profile details...');
    const formattedPhone = form.phone ? `+94${form.phone}` : '';

    const res = await updateUser({
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email.trim(),
      phone: formattedPhone,
      address: form.address,
      city: form.city,
      district: form.state,
      postalCode: form.postalCode,
    });

    if (res.success) {
      setSaved(true);
      toast.success('Your profile changes have been saved!', { id: toastId });
      setTimeout(() => setSaved(false), 3000);
    } else {
      const msg = res.error || 'Failed to update profile settings.';
      setFormError(msg);
      toast.error(msg, { id: toastId });
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    const newPassErrors = {};

    if (!passwords.currentPassword) {
      newPassErrors.currentPassword = 'Current password is required.';
    }
    if (!passwords.newPassword || passwords.newPassword.length < 6) {
      newPassErrors.newPassword = 'New password must be at least 6 characters.';
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      newPassErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newPassErrors).length > 0) {
      setPassErrors(newPassErrors);
      toast.error('Please check your password fields.');
      return;
    }

    const toastId = toast.loading('Updating your password...');
    const res = await changePassword({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });

    if (res.success) {
      setPassSaved(true);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully!', { id: toastId });
      setTimeout(() => setPassSaved(false), 3000);
    } else {
      const msg = res.error || 'Failed to update password.';
      setPassFormError(msg);
      toast.error(msg, { id: toastId });
    }
  }

  const passwordsMatch = passwords.newPassword && passwords.confirmPassword && passwords.newPassword === passwords.confirmPassword;
  const passwordsMismatch = passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword;

  return (
    <main className="flex-grow flex flex-col md:flex-row w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 py-12 gap-8">
      {/* Unified Account Sidebar */}
      <AccountSidebar />

      {/* Main Content Area */}
      <section className="flex-grow max-w-3xl space-y-8">
        <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-background mb-6">
          Profile Settings
        </h1>

        {/* ── Form 1: Personal & Delivery Information ── */}
        <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-6 md:p-10 rounded-xl shadow-ambient border border-outline-variant/30 flex flex-col gap-8">
          {formError && (
            <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-label-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {formError}
            </div>
          )}

          {/* Personal Details */}
          <div className="flex flex-col gap-4">
            <div className="border-b border-outline-variant/40 pb-2">
              <h3 className="font-title-sm text-title-sm text-primary font-bold uppercase tracking-widest text-xs">Personal Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Amara"
                  className={`custom-input w-full py-2 font-body-md text-body-md text-on-surface bg-transparent ${errors.firstName ? 'border-b-error' : ''}`}
                />
                {errors.firstName && (
                  <p className="text-xs text-error font-label-sm flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Perera"
                  className={`custom-input w-full py-2 font-body-md text-body-md text-on-surface bg-transparent ${errors.lastName ? 'border-b-error' : ''}`}
                />
                {errors.lastName && (
                  <p className="text-xs text-error font-label-sm flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {errors.lastName}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="customer@example.com"
                  className={`custom-input w-full py-2 font-body-md text-body-md text-on-surface bg-transparent ${errors.email ? 'border-b-error' : ''}`}
                />
                {errors.email && (
                  <p className="text-xs text-error font-label-sm flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-4">
            <div className="border-b border-outline-variant/40 pb-2">
              <h3 className="font-title-sm text-title-sm text-primary font-bold uppercase tracking-widest text-xs">Contact Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs">
                  Phone Number (+94)
                </label>
                <div className={`flex items-center border-b pb-1 ${errors.phone ? 'border-b-error' : 'border-outline-variant'}`}>
                  <span className="text-sm font-label-md text-on-surface-variant mr-2 select-none font-bold">
                    +94
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="77 123 4567"
                    maxLength={9}
                    className="w-full font-body-md text-body-md text-on-surface bg-transparent outline-none"
                  />
                  {form.phone.length === 9 && (
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  )}
                </div>
                {errors.phone ? (
                  <p className="text-xs text-error font-label-sm flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {errors.phone}
                  </p>
                ) : form.phone && form.phone.length < 9 ? (
                  <p className="text-xs text-on-surface-variant font-label-sm flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[13px]">info</span>
                    {form.phone.length}/9 digits entered
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="flex flex-col gap-4">
            <div className="border-b border-outline-variant/40 pb-2">
              <h3 className="font-title-sm text-title-sm text-primary font-bold uppercase tracking-widest text-xs">Delivery Address</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="e.g. 42 Flower Lane"
                  className="custom-input w-full py-2 font-body-md text-body-md text-on-surface bg-transparent"
                />
              </div>

              {/* State / Province Select Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs">
                  State / Province
                </label>
                <div className="relative">
                  <select
                    name="state"
                    value={form.state}
                    onChange={handleStateChange}
                    className="custom-input w-full py-2 pr-8 font-body-md text-body-md text-on-surface bg-transparent appearance-none cursor-pointer"
                  >
                    {SRI_LANKA_PROVINCES.map((p) => (
                      <option key={p} value={p} className="bg-surface-container-lowest text-on-surface py-1">
                        {p}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-[20px]">
                    unfold_more
                  </span>
                </div>
              </div>

              {/* City Select Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs">
                  City
                </label>
                <div className="relative">
                  <select
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="custom-input w-full py-2 pr-8 font-body-md text-body-md text-on-surface bg-transparent appearance-none cursor-pointer"
                  >
                    {availableCities.map((c) => (
                      <option key={c} value={c} className="bg-surface-container-lowest text-on-surface py-1">
                        {c}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-[20px]">
                    unfold_more
                  </span>
                </div>
              </div>

              {/* Postal Code */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs">
                  Postal Code (5 digits)
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="e.g. 10350"
                  maxLength={5}
                  className={`custom-input w-full py-2 font-body-md text-body-md text-on-surface bg-transparent ${errors.postalCode ? 'border-b-error' : ''}`}
                />
                {errors.postalCode && (
                  <p className="text-xs text-error font-label-sm flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {errors.postalCode}
                  </p>
                )}
              </div>

              {/* Country */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value="Sri Lanka"
                  readOnly
                  className="custom-input w-full py-2 font-body-md text-body-md text-primary font-bold bg-transparent cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4 border-t border-outline-variant/40">
            <button
              type="submit"
              className={`py-3 px-8 font-label-md text-label-md rounded-lg shadow-ambient hover:shadow-ambient-lg transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                saved ? 'bg-primary text-white' : 'bg-primary-container text-on-primary-fixed hover:bg-primary hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{saved ? 'check' : 'save'}</span>
              {saved ? 'Changes Saved!' : 'Save Profile Changes'}
            </button>
          </div>
        </form>

        {/* ── Form 2: Security & Change Password ── */}
        <form onSubmit={handlePasswordSubmit} className="bg-surface-container-lowest p-6 md:p-10 rounded-xl shadow-ambient border border-outline-variant/30 flex flex-col gap-6">
          <div className="border-b border-outline-variant/40 pb-2 flex items-center justify-between">
            <h3 className="font-title-sm text-title-sm text-primary font-bold uppercase tracking-widest text-xs">Security & Password</h3>
          </div>

          {passFormError && (
            <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-label-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {passFormError}
            </div>
          )}

          {passSaved && (
            <div className="p-3 bg-secondary-container text-secondary rounded-lg text-sm font-label-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Password updated successfully!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Password */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePassChange}
                  placeholder="Enter your current password"
                  className="custom-input w-full py-2 pr-10 font-body-md text-body-md text-on-surface bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">{showCurrent ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
              {passErrors.currentPassword && (
                <p className="text-xs text-error font-label-sm flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {passErrors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePassChange}
                  placeholder="Min. 6 characters"
                  className="custom-input w-full py-2 pr-10 font-body-md text-body-md text-on-surface bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">{showNew ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
              {passErrors.newPassword && (
                <p className="text-xs text-error font-label-sm flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {passErrors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePassChange}
                  placeholder="Re-enter new password"
                  className="custom-input w-full py-2 pr-10 font-body-md text-body-md text-on-surface bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">{showConfirm ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
              {passErrors.confirmPassword ? (
                <p className="text-xs text-error font-label-sm flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {passErrors.confirmPassword}
                </p>
              ) : (passwordsMatch || passwordsMismatch) ? (
                <p className={`text-xs font-label-sm flex items-center gap-1 mt-1 ${passwordsMatch ? 'text-primary' : 'text-error'}`}>
                  <span className="material-symbols-outlined text-[14px]">{passwordsMatch ? 'check_circle' : 'cancel'}</span>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-outline-variant/40">
            <button
              type="submit"
              disabled={savingPass}
              className="py-3 px-8 font-label-md text-label-md rounded-lg shadow-ambient hover:shadow-ambient-lg transition-all duration-300 flex items-center gap-2 cursor-pointer bg-primary-container text-on-primary-fixed hover:bg-primary hover:text-white disabled:opacity-50"
            >
              {savingPass ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">lock_reset</span>
              )}
              {savingPass ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
