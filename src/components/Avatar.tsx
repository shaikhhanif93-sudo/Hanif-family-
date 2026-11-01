import React from 'react';

interface AvatarProps {
  avatar?: string;
  name?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: React.FC<AvatarProps> = ({
  avatar,
  name = 'User',
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
  };

  const isImage =
    avatar &&
    (avatar.startsWith('data:image') ||
      avatar.startsWith('http://') ||
      avatar.startsWith('https://') ||
      avatar.startsWith('blob:'));

  return (
    <div
      className={`rounded-2xl overflow-hidden shrink-0 flex items-center justify-center font-bold select-none ${
        sizeClasses[size]
      } ${className}`}
    >
      {isImage ? (
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // fallback if image fails
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span className="leading-none">{avatar || name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
};
