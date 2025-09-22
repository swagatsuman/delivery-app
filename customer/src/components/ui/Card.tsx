import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    shadow?: 'none' | 'sm' | 'md' | 'lg';
    border?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
                                              children,
                                              className = '',
                                              padding = 'md',
                                              shadow = 'sm',
                                              border = true,
                                              onClick
                                          }) => {
    const baseClasses = 'bg-surface rounded-xl';

    const paddingClasses = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6'
    };

    const shadowClasses = {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg'
    };

    const borderClasses = border ? 'border border-secondary-200' : '';
    const clickableClasses = onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : '';

    return (
        <div
            className={`${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${borderClasses} ${clickableClasses} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
