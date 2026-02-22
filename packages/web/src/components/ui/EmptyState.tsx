import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from './Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    to?: string;
    onClick?: () => void;
    loading?: boolean;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center justify-center py-16 ${className}`}
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rumi-primary/10 to-rumi-accent/10 flex items-center justify-center text-rumi-primary/50 animate-gentle-float">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-rumi-text/60 mt-5">{title}</h3>
      {description && (
        <p className="text-sm text-rumi-text/40 mt-1.5 max-w-sm text-center">{description}</p>
      )}
      {action && (
        <div className="mt-5">
          {action.to ? (
            <Link to={action.to}>
              <Button variant="primary" size="md">{action.label}</Button>
            </Link>
          ) : (
            <Button variant="primary" size="md" onClick={action.onClick} loading={action.loading}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default EmptyState;
