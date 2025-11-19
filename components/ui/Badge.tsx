import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'default';
  className?: string;
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => {
  return (
    <span className={cn(
      'inline-flex items-center px-3 py-0.5 rounded-full text-sm',
      {
        'bg-green-100 text-green-800 border border-green-800': variant === 'success',
        'bg-red-100 text-red-800': variant === 'danger',
        'bg-yellow-100 text-yellow-800': variant === 'warning',
        'bg-accent-1 text-grey': variant === 'default',
      },
      className
    )}>
      {children}
    </span>
  );
};