import { useState } from 'react';

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    name: 'Pramod Wijenayake',
    email: 'pramod@malmalee.lk',
    phone: '+94 77 123 4567',
    role: 'Super Admin',
    avatar: '',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });

  const [savedProfile, setSavedProfile] = useState(false);
  const [savedPass, setSavedPass] = useState(false);
  const [passError, setPassError] = useState('');

  function handleProfileChange(e) {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  }

  function handlePassChange(e) {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setPassError('');
  }

  function handleProfileSubmit(e) {
    e.preventDefault();
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2500);
  }

  function handlePassSubmit(e) {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirmPass) {
      setPassError('New Password and Confirm Password do not match!');
      return;
    }
    if (passwords.newPass.length < 6) {
      setPassError('New Password must be at least 6 characters.');
      return;
    }
    setSavedPass(true);
    setPasswords({ current: '', newPass: '', confirmPass: '' });
    setTimeout(() => setSavedPass(false), 2500);
  }

  function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (file) {
      setProfile({ ...profile, avatar: URL.createObjectURL(file) });
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="border-b border-outline-variant/30 pb-4">
        <h1 className="font-headline-md text-headline-md text-primary mb-1">Admin Profile Settings</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Update your personal administrator account details and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Personal Information & Avatar */}
        <div className="lg:col-span-7 space-y-8">
          <form onSubmit={handleProfileSubmit} className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-6">
            <h2 className="font-title-sm text-title-sm text-primary border-b border-outline-variant/30 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined">person</span>
              Personal Account Information
            </h2>

            {/* Avatar Uploader */}
            <div className="flex items-center gap-5 p-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
              <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center font-bold text-primary text-2xl overflow-hidden border-2 border-primary shrink-0 relative group">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
              <div className="space-y-1">
                <p className="font-title-sm text-title-sm text-primary">{profile.name}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-2">{profile.role}</p>
                <button
                  type="button"
                  onClick={() => document.getElementById('admin-avatar-input').click()}
                  className="px-4 py-1.5 border border-primary text-primary rounded-full font-label-sm text-label-sm hover:bg-primary hover:text-white transition-all cursor-pointer"
                >
                  Change Profile Picture
                </button>
                <input
                  id="admin-avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="name">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={profile.name}
                  onChange={handleProfileChange}
                  required
                  className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="email">
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  required
                  className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface"
                  />
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1" htmlFor="role">
                    Assigned Role
                  </label>
                  <input
                    id="role"
                    name="role"
                    type="text"
                    value={profile.role}
                    readOnly
                    className="w-full bg-primary-container/20 border-b-2 border-outline-variant py-2 font-body-md text-body-md text-primary font-bold cursor-not-allowed outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className={`px-8 py-3 rounded-full font-label-md text-label-md shadow-ambient transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  savedProfile ? 'bg-primary text-white' : 'bg-primary-container text-on-background hover:bg-primary hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{savedProfile ? 'check' : 'save'}</span>
                {savedProfile ? 'Profile Updated!' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Security & Change Password */}
        <div className="lg:col-span-5 space-y-8">
          <form onSubmit={handlePassSubmit} className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-6">
            <h2 className="font-title-sm text-title-sm text-primary border-b border-outline-variant/30 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined">lock_reset</span>
              Security & Password
            </h2>

            {passError && (
              <div className="p-3 bg-error-container/40 border border-error/30 text-error rounded-lg text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{passError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="current">
                  Current Password
                </label>
                <input
                  id="current"
                  name="current"
                  type="password"
                  value={passwords.current}
                  onChange={handlePassChange}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="newPass">
                  New Password
                </label>
                <input
                  id="newPass"
                  name="newPass"
                  type="password"
                  value={passwords.newPass}
                  onChange={handlePassChange}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="confirmPass">
                  Confirm New Password
                </label>
                <input
                  id="confirmPass"
                  name="confirmPass"
                  type="password"
                  value={passwords.confirmPass}
                  onChange={handlePassChange}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className={`w-full py-3.5 rounded-full font-label-md text-label-md shadow-ambient transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  savedPass ? 'bg-primary text-white' : 'bg-primary-container text-on-background hover:bg-primary hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{savedPass ? 'check' : 'security'}</span>
                {savedPass ? 'Password Updated!' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
