import { type HTMLAttributes, type ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variantStyles = {
  default: 'bg-white rounded-2xl border border-rumi-primary-light/15 shadow-sm',
  elevated: 'bg-white rounded-2xl border border-rumi-primary-light/15 shadow-lg shadow-rumi-primary/[0.05]',
  interactive:
    'bg-white rounded-2xl border border-rumi-primary-light/15 shadow-md shadow-rumi-primary/[0.04] hover:shadow-xl hover:shadow-rumi-primary/[0.08] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer',
  bordered: 'bg-white rounded-2xl border-2 border-rumi-primary-light/25',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
