import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
                                                  variant = 'primary',
                                                  size = 'md',
                                                  loading = false,
                                                  icon,
                                                  children,
                                                  className = '',
                                                  disabled,
                                                  ...props
                                              }) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500',
        secondary: 'bg-secondary-100 hover:bg-secondary-200 text-secondary-700 focus:ring-secondary-500',
        ghost: 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 focus:ring-secondary-500',
        danger: 'bg-error-500 hover:bg-error-600 text-white focus:ring-error-500',
        success: 'bg-success-500 hover:bg-success-600 text-white focus:ring-success-500',
        warning: 'bg-warning-500 hover:bg-warning-600 text-white focus:ring-warning-500'
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!loading && icon && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    );
};
