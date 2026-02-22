import { IconX } from './Icons';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorAlert({ message, onDismiss, className = '' }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl
        bg-rumi-danger/5 border border-rumi-danger/20
        animate-fade-in-up
        ${className}
      `}
    >
      <div className="shrink-0 w-5 h-5 mt-0.5">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5 text-rumi-danger"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <p className="text-sm text-rumi-danger flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 text-rumi-danger/40 hover:text-rumi-danger transition-colors"
        >
          <IconX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default ErrorAlert;
