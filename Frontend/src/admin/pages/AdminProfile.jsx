import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function validateProfileForm(data) {
  const errors = {};
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (data.phone) {
    if (data.phone.length !== 9) {
      errors.phone = 'Phone number must be exactly 9 digits after +94 (e.g. 77 123 4567).';
    }
  }
  return errors;
}

function validatePasswordForm(data) {
  const errors = {};
  if (!data.currentPassword) {
    errors.currentPassword = 'Current password is required.';
  }
  if (!data.newPassword || data.newPassword.length < 6) {
    errors.newPassword = 'New password must be at least 6 characters.';
  }
  if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  return errors;
}

export default function AdminProfile() {
  const { user, updateUser, changePassword } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: (user?.phone || '').replace('+94', '').replace(/\s/g, ''),
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileErrors, setProfileErrors] = useState({});
  const [profileFormError, setProfileFormError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [passErrors, setPassErrors] = useState({});
  const [passFormError, setPassFormError] = useState('');
  const [savingPass, setSavingPass] = useState(false);
  const [passSaved, setPassSaved] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sync user state when loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: (user.phone || '').replace('+94', '').replace(/\s/g, ''),
      });
    }
  }, [user]);

  function handleProfileChange(e) {
    const { name, value } = e.target;
    if (name === 'phone') {
      let val = value.replace(/\D/g, '');
      if (val.startsWith('0')) val = val.substring(1);
      if (val.length > 9) val = val.substring(0, 9);
      setFormData((prev) => ({ ...prev, phone: val }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setProfileErrors((prev) => ({ ...prev, [name]: '' }));
    setProfileFormError('');
    setProfileSaved(false);
  }

  function handlePassChange(e) {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setPassErrors((prev) => ({ ...prev, [name]: '' }));
    setPassFormError('');
    setPassSaved(false);
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    const errors = validateProfileForm(formData);
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      toast.error('Please check personal information errors.');
      return;
    }

    setSavingProfile(true);
    setProfileFormError('');
    const toastId = toast.loading('Saving profile updates...');

    const formattedPhone = formData.phone ? `+94${formData.phone}` : '';
    const res = await updateUser({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formattedPhone,
    });

    setSavingProfile(false);
    if (res.success) {
      setProfileSaved(true);
      toast.success('Your profile details have been saved!', { id: toastId });
      setTimeout(() => setProfileSaved(false), 3000);
    } else {
      const msg = res.error || 'Failed to update profile changes.';
      setProfileFormError(msg);
      toast.error(msg, { id: toastId });
    }
  }

  async function handlePassSubmit(e) {
    e.preventDefault();
    const errors = validatePasswordForm(passwords);
    if (Object.keys(errors).length > 0) {
      setPassErrors(errors);
      toast.error('Please check password errors.');
      return;
    }

    setSavingPass(true);
    setPassFormError('');
    const toastId = toast.loading('Updating security credentials...');

    const res = await changePassword({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });

    setSavingPass(false);
    if (res.success) {
      setPassSaved(true);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!', { id: toastId });
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
    <div className="p-6 md:p-10 space-y-8 max-w-[1200px] mx-auto w-full">
      {/* Page Header */}
      <div className="border-b border-outline-variant/40 pb-4">
        <h1 className="font-headline-md text-headline-md text-on-background mb-1">Admin Profile Settings</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Update your personal administrator account details and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Personal Information */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleProfileSubmit} className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-ambient border border-outline-variant/40 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/60">
              <span className="material-symbols-outlined text-primary text-[20px]">person</span>
              <h2 className="font-title-sm text-sm text-primary font-bold uppercase tracking-widest">
                Personal Account Information
              </h2>
            </div>

            {profileFormError && (
              <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-label-md flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {profileFormError}
              </div>
            )}

            {profileSaved && (
              <div className="p-3 bg-secondary-container text-secondary rounded-lg text-sm font-label-md flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Profile details saved successfully!
              </div>
            )}


            <div className="space-y-4">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs" htmlFor="name">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleProfileChange}
                  placeholder="e.g. Pramod Wijenayake"
                  className={`w-full px-3 py-2.5 bg-surface-container-low border rounded-lg font-body-md text-on-surface outline-none focus:border-primary transition-colors ${
                    profileErrors.name ? 'border-error bg-error-container/10' : 'border-outline-variant'
                  }`}
                />
                {profileErrors.name && (
                  <p className="text-xs text-error font-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {profileErrors.name}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs" htmlFor="email">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  placeholder="admin@malmalee.lk"
                  className={`w-full px-3 py-2.5 bg-surface-container-low border rounded-lg font-body-md text-on-surface outline-none focus:border-primary transition-colors ${
                    profileErrors.email ? 'border-error bg-error-container/10' : 'border-outline-variant'
                  }`}
                />
                {profileErrors.email && (
                  <p className="text-xs text-error font-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {profileErrors.email}
                  </p>
                )}
              </div>

              {/* Phone & Assigned Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs" htmlFor="phone">
                    Phone Number (+94)
                  </label>
                  <div className={`flex rounded-lg border overflow-hidden ${profileErrors.phone ? 'border-error' : 'border-outline-variant'} focus-within:border-primary transition-colors`}>
                    <span className="flex items-center px-3 bg-surface-container border-r border-outline-variant/60 text-sm font-label-md text-on-surface-variant whitespace-nowrap">
                      +94
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleProfileChange}
                      placeholder="77 123 4567"
                      maxLength={9}
                      className={`flex-1 px-3 py-2.5 bg-surface-container-low font-body-md text-on-surface outline-none ${profileErrors.phone ? 'bg-error-container/10' : ''}`}
                    />
                    {formData.phone.length === 9 && (
                      <span className="flex items-center pr-3 text-primary">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      </span>
                    )}
                  </div>
                  {profileErrors.phone ? (
                    <p className="text-xs text-error font-label-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      {profileErrors.phone}
                    </p>
                  ) : formData.phone && formData.phone.length < 9 ? (
                    <p className="text-xs text-on-surface-variant font-label-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">info</span>
                      {formData.phone.length}/9 digits entered
                    </p>
                  ) : null}
                </div>

                {/* Assigned Role */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs">
                    Assigned Role
                  </label>
                  <input
                    type="text"
                    value="System Administrator"
                    readOnly
                    className="w-full px-3 py-2.5 bg-surface-container border border-outline-variant/60 rounded-lg font-body-md text-primary font-bold cursor-not-allowed outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-outline-variant">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 bg-primary text-white rounded-full font-label-md text-label-md hover:bg-primary/80 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-ambient"
              >
                {savingProfile ? (
                  <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">save</span>
                )}
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Security & Password */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handlePassSubmit} className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-ambient border border-outline-variant/40 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/60">
              <span className="material-symbols-outlined text-primary text-[20px]">lock_reset</span>
              <h2 className="font-title-sm text-sm text-primary font-bold uppercase tracking-widest">
                Security & Password
              </h2>
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

            <div className="space-y-4">
              {/* Current Password */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs" htmlFor="currentPassword">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrent ? 'text' : 'password'}
                    value={passwords.currentPassword}
                    onChange={handlePassChange}
                    placeholder="Enter current password"
                    className={`w-full px-3 py-2.5 pr-10 bg-surface-container-low border rounded-lg font-body-md text-on-surface outline-none focus:border-primary transition-colors ${
                      passErrors.currentPassword ? 'border-error bg-error-container/10' : 'border-outline-variant'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">{showCurrent ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
                {passErrors.currentPassword && (
                  <p className="text-xs text-error font-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {passErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs" htmlFor="newPassword">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNew ? 'text' : 'password'}
                    value={passwords.newPassword}
                    onChange={handlePassChange}
                    placeholder="Min. 6 characters"
                    className={`w-full px-3 py-2.5 pr-10 bg-surface-container-low border rounded-lg font-body-md text-on-surface outline-none focus:border-primary transition-colors ${
                      passErrors.newPassword ? 'border-error bg-error-container/10' : 'border-outline-variant'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">{showNew ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
                {passErrors.newPassword && (
                  <p className="text-xs text-error font-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {passErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-xs" htmlFor="confirmPassword">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={passwords.confirmPassword}
                    onChange={handlePassChange}
                    placeholder="Re-enter new password"
                    className={`w-full px-3 py-2.5 pr-10 bg-surface-container-low border rounded-lg font-body-md text-on-surface outline-none focus:border-primary transition-colors ${
                      passErrors.confirmPassword ? 'border-error bg-error-container/10' : 'border-outline-variant'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">{showConfirm ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
                {passErrors.confirmPassword ? (
                  <p className="text-xs text-error font-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {passErrors.confirmPassword}
                  </p>
                ) : (passwordsMatch || passwordsMismatch) ? (
                  <p className={`text-xs font-label-sm flex items-center gap-1 ${passwordsMatch ? 'text-primary' : 'text-error'}`}>
                    <span className="material-symbols-outlined text-[14px]">{passwordsMatch ? 'check_circle' : 'cancel'}</span>
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-outline-variant">
              <button
                type="submit"
                disabled={savingPass}
                className="px-6 py-2.5 bg-primary text-white rounded-full font-label-md text-label-md hover:bg-primary/80 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-ambient"
              >
                {savingPass ? (
                  <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">security</span>
                )}
                {savingPass ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
