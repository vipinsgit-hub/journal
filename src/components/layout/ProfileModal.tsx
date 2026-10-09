import React, { useState, useEffect } from 'react';
import { X, User, Globe, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthProvider';
import { profileService } from '../../features/profiles/profileService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || '');
      setTimezone(profile?.timezone || 'Asia/Kolkata');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, profile, user]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError('Display name cannot be empty.');
      return;
    }

    if (trimmedName.length > 50) {
      setError('Display name must be 50 characters or fewer.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await profileService.updateProfile(user.id, {
        display_name: trimmedName,
        timezone: timezone,
      });

      await refreshProfile();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#12151A] border border-[#272C35] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#272C35] bg-[#0D0F12]">
          <div className="flex items-center gap-2.5">
            <User size={18} className="text-white" />
            <h2 className="text-base font-semibold text-[#F4F5F7]">Account & Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#969EAB] hover:text-[#F4F5F7] hover:bg-[#181C23] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-[#FF647C]/10 border border-[#FF647C]/20 rounded-xl text-[#FF647C] text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-[#FF647C]" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-[#20C997]/10 border border-[#20C997]/20 rounded-xl text-[#20C997] text-xs flex items-center gap-2">
              <Check size={16} className="text-[#20C997]" />
              <span>Account preferences saved successfully!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#969EAB] mb-1.5">User Email</label>
            <input
              type="text"
              value={user?.email || 'demo@journal.local'}
              disabled
              className="w-full bg-[#0D0F12] border border-[#272C35] rounded-xl px-3.5 py-2.5 text-xs text-[#969EAB] opacity-75 cursor-not-allowed font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#F4F5F7] mb-1.5">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
              maxLength={50}
              className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F5F7] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#F4F5F7] mb-1.5 flex items-center gap-1.5">
              <Globe size={14} className="text-[#969EAB]" />
              <span>Timezone</span>
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F5F7] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 transition-colors"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
              <option value="America/New_York">America/New_York (EST -5:00)</option>
              <option value="Europe/London">Europe/London (GMT +0:00)</option>
              <option value="UTC">UTC (+0:00)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-[#272C35] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#181C23] hover:bg-[#272C35] text-[#969EAB] hover:text-[#F4F5F7] rounded-xl text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-semibold rounded-xl text-xs transition-colors shadow"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
