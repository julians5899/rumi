import { motion } from 'framer-motion';
import { Spinner } from './Spinner';

interface LoadingStateProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({ text, size = 'lg', className = '' }: LoadingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col items-center justify-center py-12 ${className}`}
    >
      <Spinner size={size} />
      {text && (
        <p className="text-sm text-rumi-text/40 mt-3 animate-pulse">{text}</p>
      )}
    </motion.div>
  );
}

export default LoadingState;
