import React from 'react';

const GRADIENTS = [
  'from-indigo-600 to-indigo-800 text-white shadow-indigo-500/20',
  'from-violet-600 to-purple-800 text-white shadow-purple-500/20',
  'from-blue-600 to-cyan-700 text-white shadow-blue-500/20',
  'from-emerald-600 to-teal-800 text-white shadow-emerald-500/20',
  'from-amber-500 to-orange-700 text-white shadow-orange-500/20',
  'from-rose-600 to-pink-700 text-white shadow-pink-500/20',
  'from-fuchsia-600 to-rose-700 text-white shadow-fuchsia-500/20',
  'from-sky-600 to-blue-800 text-white shadow-sky-500/20',
];

export interface UserAvatarProps {
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: 'full' | 'xl' | '2xl';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'User',
  size = 'md',
  className = '',
  rounded = '2xl',
}) => {
  const initial = (name || 'U').trim().charAt(0).toUpperCase() || 'U';

  // Deterministic color based on name string
  let hash = 0;
  const str = name || 'User';
  for (let i = 0; i < str.length; i++) {
    hash = (str.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  }
  const colorIndex = Math.abs(hash) % GRADIENTS.length;
  const gradient = GRADIENTS[colorIndex];

  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px] font-bold',
    sm: 'h-8 w-8 text-xs font-bold',
    md: 'h-10 w-10 text-sm font-bold',
    lg: 'h-12 w-12 text-base font-extrabold',
    xl: 'h-16 w-16 text-xl font-black',
  };

  const roundedClasses = {
    full: 'rounded-full',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
  };

  return (
    <div
      className={`inline-flex items-center justify-center bg-gradient-to-tr ${gradient} ${sizeClasses[size]} ${roundedClasses[rounded]} shadow-sm select-none flex-shrink-0 uppercase border border-white/20 tracking-wider font-semibold ${className}`}
      title={name}
    >
      <span>{initial}</span>
    </div>
  );
};
