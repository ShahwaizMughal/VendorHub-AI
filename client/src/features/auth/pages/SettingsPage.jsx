import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsInitialized } from '../../../store/slices/authSlice';
import {
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useDeleteAccountMutation
} from '../../../store/api/authApi';
import { DeactivateModal } from '../components/DeactivateModal';
import { ProfileSkeleton } from '../../../components/Skeleton';
import { FiUser, FiUpload, FiBriefcase, FiAlertTriangle, FiCheck, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SettingsForm = ({
  user,
  updateProfile,
  isUpdatingProfile,
  uploadAvatar,
  isUploadingAvatar,
  deleteAccount,
  isDeleting
}) => {
  const [name, setName] = useState(user.name || '');
  const [companyName, setCompanyName] = useState(user.companyName || '');
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || '');
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        name,
        ...(user.role === 'vendor' ? { companyName } : {})
      }).unwrap();
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.data?.error?.message || 'Failed to update profile');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Please select an image file');
    }

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File size must be under 5MB');
    }

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      await uploadAvatar(file).unwrap();
      toast.success('Avatar uploaded to Cloudinary');
    } catch (err) {
      toast.error(err.data?.error?.message || 'Avatar upload failed');
      setAvatarPreview(user.avatarUrl || '');
    }
  };

  const handleDeactivate = async () => {
    try {
      await deleteAccount().unwrap();
      toast.success('Account deactivated (soft-deleted) successfully');
    } catch (err) {
      toast.error(err.data?.error?.message || 'Deactivation failed');
    } finally {
      setIsDeactivateOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-100">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">Account Settings</h1>
        <p className="text-sm text-slate-400">Manage your profile, Cloudinary avatar image, and account lifecycle</p>
      </header>

      <div className="space-y-8">
        {/* Avatar Section */}
        <section aria-labelledby="avatar-section-heading" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <h2 id="avatar-section-heading" className="text-base font-semibold text-white mb-4">Profile Avatar</h2>
          <div className="flex items-center gap-6">
            <div className="relative group w-20 h-20 rounded-full bg-linear-to-tr from-indigo-500 to-emerald-400 p-1 shadow-lg">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={`${user.name}'s profile avatar`}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-xl font-bold text-indigo-300">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <label
                htmlFor="avatarUpload"
                className="absolute inset-0 bg-slate-950/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                title="Change Avatar Image"
              >
                <FiCamera className="w-6 h-6" aria-hidden="true" />
              </label>
            </div>

            <div>
              <label
                htmlFor="avatarUpload"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl cursor-pointer transition-colors shadow-md shadow-indigo-950/50 focus-within:ring-2 focus-within:ring-indigo-500"
              >
                <FiUpload className="w-4 h-4" aria-hidden="true" />
                {isUploadingAvatar ? 'Uploading to Cloudinary...' : 'Upload Avatar'}
              </label>
              <input
                type="file"
                id="avatarUpload"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
              <p className="text-xs text-slate-400 mt-2">JPG, PNG or GIF up to 5MB</p>
            </div>
          </div>
        </section>

        {/* Profile Form Section */}
        <section aria-labelledby="details-section-heading" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <h2 id="details-section-heading" className="text-base font-semibold text-white mb-4">Personal Details</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label htmlFor="settingsNameInput" className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" aria-hidden="true" />
                <input
                  id="settingsNameInput"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="settingsEmailInput" className="block text-xs font-medium text-slate-400 mb-1">
                Email Address (Read Only)
              </label>
              <input
                id="settingsEmailInput"
                type="email"
                disabled
                value={user.email || ''}
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800/60 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            {user.role === 'vendor' && (
              <div>
                <label htmlFor="settingsCompanyInput" className="block text-xs font-medium text-slate-300 mb-1">
                  Company Name
                </label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" aria-hidden="true" />
                  <input
                    id="settingsCompanyInput"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-950/50 disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <FiCheck className="w-4 h-4" aria-hidden="true" />
              {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </section>

        {/* Danger Zone / Soft Delete Section */}
        <section aria-labelledby="danger-section-heading" className="p-6 bg-red-950/10 border border-red-900/30 rounded-2xl">
          <div className="flex items-center gap-3 mb-2 text-red-400">
            <FiAlertTriangle className="w-5 h-5" aria-hidden="true" />
            <h2 id="danger-section-heading" className="text-base font-semibold text-white">Danger Zone</h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Soft-delete your account profile. Deactivating will mark your profile as inactive, revoke access tokens, and clear active refresh sessions.
          </p>

          <button
            type="button"
            onClick={() => setIsDeactivateOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors shadow-lg shadow-red-950/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Deactivate Account
          </button>
        </section>
      </div>

      <DeactivateModal
        isOpen={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
        onConfirm={handleDeactivate}
        isLoading={isDeleting}
      />
    </div>
  );
};

export const SettingsPage = () => {
  const user = useSelector(selectCurrentUser);
  const isInitialized = useSelector(selectIsInitialized);

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  if (!isInitialized || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <SettingsForm
      key={user.id}
      user={user}
      updateProfile={updateProfile}
      isUpdatingProfile={isUpdatingProfile}
      uploadAvatar={uploadAvatar}
      isUploadingAvatar={isUploadingAvatar}
      deleteAccount={deleteAccount}
      isDeleting={isDeleting}
    />
  );
};

export default SettingsPage;
