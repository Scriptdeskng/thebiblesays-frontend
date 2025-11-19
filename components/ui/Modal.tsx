import { X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const Modal = ({ isOpen, onClose, children, title, className }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn(
        'relative bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto',
        'w-full max-w-md mx-4',
        className
      )}>
        <div className="sticky top-0 bg-white border-b border-accent-2 px-6 py-4 flex items-center justify-between">
          {title && <h2 className="text-lg font-semibold text-primary">{title}</h2>}
          <button
            onClick={onClose}
            className="ml-auto p-1 hover:bg-accent-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};