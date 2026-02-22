import { type ReactNode } from 'react';

interface BadgeProps {
  variant?: 'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const variantStyles = {
  primary: 'bg-rumi-primary/10 text-rumi-primary',
  accent: 'bg-rumi-accent/10 text-rumi-accent',
  success: 'bg-emerald-50 text-emerald-600',
  danger: 'bg-red-50 text-red-600',
  warning: 'bg-amber-50 text-amber-600',
  neutral: 'bg-gray-100 text-rumi-text/60',
};

const dotColors = {
  primary: 'bg-rumi-primary',
  accent: 'bg-rumi-accent',
  success: 'bg-emerald-500',
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
  neutral: 'bg-gray-400',
};

const sizeStyles = {
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1.5 text-sm',
};

export function Badge({
  variant = 'primary',
  size = 'sm',
  dot = false,
  icon,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export default Badge;
