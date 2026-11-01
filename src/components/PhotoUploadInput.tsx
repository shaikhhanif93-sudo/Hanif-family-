import React, { useRef, useState } from 'react';
import { Camera, Upload, Check, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import { Avatar } from './Avatar';

const AVATAR_PRESETS = [
  '👨‍💼', '👩‍💼', '👨‍🍳', '👩‍🍳', '🧑‍🎓', '👩‍🎓', '👧', '👦', '👴', '👵',
  '👨‍💻', '👩‍💻', '🧑‍⚕️', '👩‍⚕️', '🧕', '👳‍♂️', '🧔', '👱‍♀️', '👶', '🐱'
];

interface PhotoUploadInputProps {
  value: string;
  onChange: (photoUrl: string) => void;
  label?: string;
  subLabel?: string;
}

export const PhotoUploadInput: React.FC<PhotoUploadInputProps> = ({
  value,
  onChange,
  label = 'Profile Picture',
  subLabel = 'Upload a real photo from your phone or select an avatar',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress/downscale to 200x200 max for instant local storage performance
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 240;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onChange(dataUrl);
        }
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {label}
          </label>
          <p className="text-[11px] text-slate-400">{subLabel}</p>
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange('👤')}
            className="text-[11px] text-slate-400 hover:text-red-500 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        {/* Avatar preview */}
        <div className="relative group">
          <Avatar
            avatar={value}
            size="xl"
            className="ring-4 ring-white dark:ring-slate-900 shadow-md bg-blue-100 dark:bg-blue-950 text-blue-600"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
            title="Upload photo"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isCompressing}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isCompressing ? 'Processing...' : 'Upload Photo'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{showPresets ? 'Hide Avatars' : 'Choose Avatar'}</span>
            </button>
          </div>

          <p className="text-[10px] text-slate-400">
            Supports JPG, PNG, WebP from your mobile gallery or webcam.
          </p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Preset selector drawer */}
      {showPresets && (
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner animate-scale-up">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Select an Avatar Icon:
          </p>
          <div className="grid grid-cols-10 gap-1.5 max-h-32 overflow-y-auto">
            {AVATAR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  onChange(preset);
                  setShowPresets(false);
                }}
                className={`p-1.5 text-xl rounded-xl hover:scale-110 transition-transform flex items-center justify-center ${
                  value === preset ? 'bg-blue-100 dark:bg-blue-950 ring-2 ring-blue-500' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
