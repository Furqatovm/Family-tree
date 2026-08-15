import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'male' | 'female' | 'other' | 'deceased';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className }) => {
  const variants = {
    primary: 'bg-[#3F6B4F]/10 text-[#3F6B4F] border-[#3F6B4F]/20',
    secondary: 'bg-[#A67C52]/10 text-[#A67C52] border-[#A67C52]/20',
    accent: 'bg-[#D6A756]/15 text-[#8A641C] border-[#D6A756]/30',
    male: 'bg-sky-50 text-sky-700 border-sky-200',
    female: 'bg-rose-50 text-rose-700 border-rose-200',
    other: 'bg-purple-50 text-purple-700 border-purple-200',
    deceased: 'bg-stone-100 text-stone-600 border-stone-300',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
