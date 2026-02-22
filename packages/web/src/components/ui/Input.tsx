import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-rumi-text/70 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rumi-text/30">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 rounded-xl border-2 bg-white text-sm text-rumi-text
              placeholder:text-rumi-text/30 transition-all duration-200
              ${icon ? 'pl-11' : ''}
              ${
                error
                  ? 'border-rumi-danger/50 focus:border-rumi-danger focus:ring-4 focus:ring-rumi-danger/10'
                  : 'border-rumi-primary-light/30 focus:border-rumi-primary focus:ring-4 focus:ring-rumi-primary/10'
              }
              focus:outline-none
              disabled:bg-gray-50 disabled:text-rumi-text/40 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rumi-danger mt-1.5">{error}</p>}
        {hint && !error && <p className="text-xs text-rumi-text/40 mt-1.5">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
