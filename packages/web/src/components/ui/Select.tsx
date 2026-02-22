import { forwardRef, type SelectHTMLAttributes } from 'react';
import { IconChevronDown } from './Icons';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, children, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-rumi-text/70 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full px-4 py-3 rounded-xl border-2 bg-white text-sm text-rumi-text
              appearance-none pr-10 transition-all duration-200
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
          >
            {children}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-rumi-text/30">
            <IconChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-rumi-danger mt-1.5">{error}</p>}
        {hint && !error && <p className="text-xs text-rumi-text/40 mt-1.5">{hint}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
