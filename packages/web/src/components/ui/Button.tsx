import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles = {
  primary:
    'bg-rumi-primary text-white shadow-md hover:bg-rumi-primary-dark hover:shadow-lg active:shadow-md',
  secondary:
    'bg-rumi-primary/10 text-rumi-primary border border-rumi-primary/20 hover:bg-rumi-primary/20',
  outline:
    'border-2 border-rumi-primary/30 text-rumi-primary hover:bg-rumi-primary/5 hover:border-rumi-primary/50',
  ghost:
    'text-rumi-text/60 hover:text-rumi-text hover:bg-rumi-text/5',
  danger:
    'bg-rumi-danger text-white shadow-md hover:bg-red-600 hover:shadow-lg active:shadow-md',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-200 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}

export default Button;
