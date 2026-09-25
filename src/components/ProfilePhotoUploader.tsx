import React, { useState, useRef } from 'react';

interface ProfilePhotoUploaderProps {
  currentAvatarUrl?: string | null;
  name: string;
  role: 'student' | 'industry' | 'institution' | 'admin';
  onPhotoUpdated?: (newUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({
  currentAvatarUrl,
  name,
  role,
  onPhotoUpdated,
  size = 'md'
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize prop updates
  React.useEffect(() => {
    setAvatarUrl(currentAvatarUrl || null);
  }, [currentAvatarUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Invalid file format. Please choose a JPG, PNG, or WebP image.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File exceeds 5MB size limit. Please choose a smaller image.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem('ks_token');
      const formData = new FormData();
      formData.append('photo', selectedFile);

      const res = await fetch('/api/profile/photo', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      const json = await res.json();
      if (json.success && json.data?.avatarUrl) {
        const newUrl = json.data.avatarUrl;
        setAvatarUrl(newUrl);
        if (onPhotoUpdated) onPhotoUpdated(newUrl);
        setIsModalOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        setErrorMsg(json.error?.message || 'Failed to save profile picture.');
      }
    } catch (err) {
      setErrorMsg('Network error while uploading photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('ks_token');
      const res = await fetch('/api/profile/photo', {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const json = await res.json();
      if (json.success) {
        setAvatarUrl(null);
        if (onPhotoUpdated) onPhotoUpdated(null);
      }
    } catch (err) {
      console.error('Failed to remove photo', err);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-10 h-10 text-base',
    md: 'w-14 h-14 text-xl',
    lg: 'w-20 h-20 text-3xl'
  }[size];

  const roleGradients = {
    student: 'from-blue-600 to-indigo-600',
    industry: 'from-emerald-600 to-teal-700',
    institution: 'from-purple-600 to-indigo-700',
    admin: 'from-amber-600 to-orange-700'
  }[role];

  return (
    <div className="relative group inline-block">
      {/* Avatar Container */}
      <div className="relative flex items-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className={`${sizeClasses} rounded-2xl object-cover border-2 border-white/40 shadow-md`}
          />
        ) : (
          <div
            className={`${sizeClasses} rounded-2xl bg-gradient-to-tr ${roleGradients} flex items-center justify-center text-white font-bold shadow-md uppercase`}
          >
            {name ? name[0] : 'U'}
          </div>
        )}

        {/* Hover trigger icon to change picture */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-slate-900/90 text-white hover:bg-blue-600 transition-colors shadow-lg border border-white/20 cursor-pointer"
          title="Upload or Change Photo"
        >
          <span className="material-symbols-outlined text-xs">photo_camera</span>
        </button>
      </div>

      {/* Modal for Preview & Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-slate-900 relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                setErrorMsg(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer text-lg font-bold"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Update Profile Picture
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              JPG, PNG, or WebP. Maximum file size: 5MB.
            </p>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Preview Box */}
            <div className="flex flex-col items-center justify-center my-4">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center shadow-inner relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-tr ${roleGradients} flex items-center justify-center text-white text-3xl font-bold uppercase`}
                  >
                    {name ? name[0] : 'U'}
                  </div>
                )}
              </div>
              {previewUrl && (
                <span className="text-[11px] text-emerald-600 font-semibold mt-2">
                  Preview ready to save
                </span>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="space-y-2 mt-5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">cloud_upload</span>
                <span>{previewUrl ? 'Choose Different File' : 'Select Image File'}</span>
              </button>

              {previewUrl && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSaveUpload}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">check</span>
                      <span>Save &amp; Apply Photo</span>
                    </>
                  )}
                </button>
              )}

              {avatarUrl && !previewUrl && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRemovePhoto}
                  className="w-full py-2 px-4 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  <span>Remove Current Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
