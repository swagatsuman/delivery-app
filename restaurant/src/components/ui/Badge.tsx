import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
    size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
                                                children,
                                                variant = 'default',
                                                size = 'sm'
                                            }) => {
    const variantClasses = {
        default: 'bg-secondary-100 text-secondary-700',
        success: 'bg-success-100 text-success-700',
        warning: 'bg-warning-100 text-warning-700',
        error: 'bg-error-100 text-error-700',
        info: 'bg-blue-100 text-blue-700',
        primary: 'bg-primary-100 text-primary-700'
    };

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm'
    };

    return (
        <span className={`inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
    );
};
