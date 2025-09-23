import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
    size?: 'sm' | 'md';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
                                                children,
                                                variant = 'default',
                                                size = 'md',
                                                className = ''
                                            }) => {
    const baseClasses = 'inline-flex items-center font-medium rounded-full';

    const variantClasses = {
        default: 'bg-secondary-100 text-secondary-800',
        success: 'bg-success-100 text-success-800',
        error: 'bg-error-100 text-error-800',
        warning: 'bg-warning-100 text-warning-800',
        info: 'bg-blue-100 text-blue-800'
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm'
    };

    return (
        <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
            {children}
        </span>
    );
};
