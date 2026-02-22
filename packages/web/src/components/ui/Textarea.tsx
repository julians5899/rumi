import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  resizable?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, resizable = false, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-rumi-text/70 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl border-2 bg-white text-sm text-rumi-text
            placeholder:text-rumi-text/30 transition-all duration-200
            ${resizable ? '' : 'resize-none'}
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
        {error && <p className="text-xs text-rumi-danger mt-1.5">{error}</p>}
        {hint && !error && <p className="text-xs text-rumi-text/40 mt-1.5">{hint}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
