import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { IconType } from 'react-icons';

interface StatsCardProps {
    icon: IconType;
    title: string;
    value: string | number;
    change: number;
    iconBgColor?: string;
    iconColor?: string;
}

export function StatsCard({
    icon: Icon,
    title,
    value,
    change,
    iconBgColor = 'bg-primary-admin/10',
    iconColor = 'text-primary-admin',
}: StatsCardProps) {
    const isPositive = change >= 0;

    return (
        <div className="bg-admin-primary/4 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-2 xl:gap-5">
                <div className={`w-10 h-10 ${iconBgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={iconColor} size={20} />
                </div>
                <div className='overflow-hidden'>
                    <p className="text-sm mb-1 text-admin-primary/60">{title}</p>
                    <p className="text-3xl font-extrabold text-admin-primary truncate">{value}</p>
                </div>
            </div>
            <div className="mt-10 flex items-center gap-2">
                <div className={`flex items-center space-x-1 text-sm rounded-lg py-1 px-2 ${isPositive ? 'text-[#2AA31F] bg-[#2AA31F]/15' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="font-medium">{Math.abs(change)}%</span>
                </div>
                <p className="text-[#ABABAB]">vs last month</p>
            </div>
        </div>
    );
}

interface StatsCardProps {
    icon: IconType;
    title: string;
    value: string | number;
    change: number;
    iconBgColor?: string;
    iconColor?: string;
}

export function StatsCard2({
    icon: Icon,
    title,
    value,
    change,
    iconBgColor = 'bg-primary-admin/10',
    iconColor = 'text-primary-admin',
}: StatsCardProps) {
    const isPositive = change >= 0;

    return (
        <div className="bg-admin-primary rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-2 xl:gap-5">
                <div className={`w-10 h-10 ${iconBgColor} rounded-md flex items-center justify-center`}>
                    <Icon className={iconColor} size={20} />
                </div>
                <div className='overflow-hidden'>
                    <p className="text-sm mb-1 text-[#ABABAB]">{title}</p>
                    <p className="text-3xl font-extrabold text-white truncate">{value}</p>
                </div>
            </div>
            <div className="mt-10 flex items-center gap-2">
                <div className={`flex items-center space-x-1 text-sm rounded-lg py-1 px-2 ${isPositive ? 'text-[#2AA31F] bg-[#2AA31F]/15' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="font-medium">{Math.abs(change)}%</span>
                </div>
                <p className="text-[#ABABAB]">vs last month</p>
            </div>
        </div>
    );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
}: ButtonProps) {
    const baseStyles = 'rounded-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-admin-primary text-[#E3E3E3] hover:bg-opacity-90',
        secondary: 'bg-accent-1 text-primary hover:bg-accent-2',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        ghost: 'text-primary hover:bg-accent-1',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm sm:text-base',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
    const variants = {
        default: 'bg-[#626262]/8 text-[#626262]',
        success: 'bg-[#2AA31F]/7 text-[#2AA31F]',
        warning: 'bg-orange-50 text-orange-600',
        danger: 'bg-red-50 text-red-600',
        info: 'bg-blue-50 text-blue-600',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg ${variants[variant]}`}>
            {children}
        </span>
    );
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
                <div className="sticky top-0 bg-white border-b border-accent-2 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-medium text-admin-primary">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-grey hover:text-primary transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div>
            {label && (
                <label className="block text-admin-primary mb-1">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none transition-all ${error ? 'border-red-500' : ''
                    } ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
    return (
        <div>
            {label && (
                <label className="block text-admin-primary mb-1">
                    {label}
                </label>
            )}
            <select
                className={`w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none transition-all ${error ? 'border-red-500' : ''
                    } ${className}`}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
    return (
        <div>
            {label && (
                <label className="block text-admin-primary mb-1">
                    {label}
                </label>
            )}
            <textarea
                className={`w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none transition-all ${error ? 'border-red-500' : ''
                    } ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div className="flex items-center justify-center">
            <div className={`animate-spin rounded-full border-b-2 border-primary ${sizes[size]}`}></div>
        </div>
    );
}

interface EmptyStateProps {
    icon?: IconType;
    title: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            {Icon && (
                <div className="w-16 h-16 bg-accent-1 rounded-full flex items-center justify-center mb-4">
                    <Icon className="text-grey" size={32} />
                </div>
            )}
            <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
            {description && <p className="text-sm text-grey text-center mb-4">{description}</p>}
            {action && <div>{action}</div>}
        </div>
    );
}
