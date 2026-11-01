import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { Phone, ArrowRight, ShieldCheck, Heart, Camera } from 'lucide-react';
import { normalizePhoneNumber } from '../utils/familyLogic';
import { PhotoUploadInput } from './PhotoUploadInput';
import { Avatar } from './Avatar';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithPhone, members, switchUser } = useFamily();

  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [relationInput, setRelationInput] = useState('Mother');
  const [avatar, setAvatar] = useState('👩‍🍳');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = normalizePhoneNumber(phoneInput);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid 10-digit mobile number');
      return;
    }

    loginWithPhone(validation.normalized, nameInput || undefined, relationInput, avatar);
    onClose();
  };

  const quickLogin = (memberId: string) => {
    switchUser(memberId);
    onClose();
  };

  const adminMember = members.find((m) => m.role === 'admin');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header banner */}
        <div className="p-5 sm:p-6 bg-linear-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white text-center relative shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-2 shadow-lg">
            <Heart className="w-6 h-6 text-rose-300 fill-rose-300" />
          </div>
          <h2 className="text-xl font-black">Family Member Sign-In</h2>
          <p className="text-xs text-blue-100 mt-1">
            Sign in with your mobile number & profile photo
          </p>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            {/* Profile Picture Upload */}
            <PhotoUploadInput
              value={avatar}
              onChange={setAvatar}
              label="Member Profile Picture *"
              subLabel="Upload a real photo from your mobile camera or gallery"
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mobile Number *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  required
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="98765 43210"
                  className="w-full pl-16 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden transition-all text-slate-800 dark:text-slate-100"
                />
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Fatima Shaikh, Ayaan"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-hidden transition-all text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Family Relation *
              </label>
              <select
                value={relationInput}
                onChange={(e) => setRelationInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-hidden text-slate-800 dark:text-slate-100"
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Grandmother">Grandmother</option>
                <option value="Grandfather">Grandfather</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Uncle">Uncle</option>
                <option value="Aunt">Aunt</option>
                <option value="Other">Other Family Member</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <span>Submit & Request Access</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Admin Approval Notice */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            <span className="font-bold">Family Security:</span> Once you sign in with your mobile number, Shaikh Hanif (Admin) will approve your request and configure your household permissions.
          </div>

          {/* Direct Switch to Admin Shaikh Hanif */}
          {adminMember && (
            <div className="pt-3 border-t border-slate-150 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Active Admin Profile:
              </p>
              <button
                onClick={() => quickLogin(adminMember.id)}
                className="w-full p-2.5 rounded-xl border border-blue-200 dark:border-blue-800/80 hover:border-blue-400 bg-blue-50/60 dark:bg-blue-950/40 text-left transition-all flex items-center gap-3"
              >
                <Avatar avatar={adminMember.avatar} name={adminMember.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-100 truncate">
                    {adminMember.name} (Admin)
                  </p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-300 truncate">
                    {adminMember.phone}
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-600">Switch →</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
