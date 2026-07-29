import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [avatar, setAvatar] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('phone', form.phone);
      if (avatar) data.append('avatar', avatar);
      const res = await api.put('/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(res.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', passwords);
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Change failed');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
        <div className="flex items-center gap-4 mb-6">
          <img
            src={user?.avatar?.url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user?.name}
            alt="avatar"
            className="w-16 h-16 rounded-full object-cover border border-slate-300 dark:border-slate-700"
          />
          <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} />
        </div>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <input
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
            placeholder="Name"
          />
          <input
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
            placeholder="Phone"
          />
          <input disabled value={user?.email} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500" />
          <button disabled={savingProfile} className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-60">
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <input
            type="password" required placeholder="Current password" value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          />
          <input
            type="password" required minLength={6} placeholder="New password" value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          />
          <button disabled={savingPassword} className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60">
            {savingPassword ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
