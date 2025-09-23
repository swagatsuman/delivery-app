import React from 'react';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
}

export const Card: React.FC<CardProps> = ({
                                              children,
                                              title,
                                              padding = 'md',
                                              className = ''
                                          }) => {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    return (
        <div className={`card ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-secondary-200">
                    <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
                </div>
            )}
            <div className={title ? paddingClasses[padding] : paddingClasses[padding]}>
                {children}
            </div>
        </div>
    );
};
