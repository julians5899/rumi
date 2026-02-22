import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({ isOpen, onClose, title, size = 'md', children }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-rumi-text/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={`
              relative w-full ${sizeStyles[size]}
              bg-white rounded-2xl shadow-2xl p-6
            `}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-rumi-text">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-rumi-text/30 hover:text-rumi-text hover:bg-rumi-text/5 transition-colors"
                >
                  <IconX className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content */}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
