import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
                                              children,
                                              className = '',
                                              title,
                                              subtitle,
                                              actions,
                                              padding = 'md'
                                          }) => {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    return (
        <div className={`card ${paddingClasses[padding]} ${className}`}>
            {(title || subtitle || actions) && (
                <div className="flex items-start justify-between mb-6">
                    <div>
                        {title && <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>}
                        {subtitle && <p className="text-sm text-secondary-600 mt-1">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex space-x-2">{actions}</div>}
                </div>
            )}
            {children}
        </div>
    );
};
