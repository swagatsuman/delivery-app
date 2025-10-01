import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    helpText?: string;
    multiline?: boolean;
    rows?: number;
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(({
                                                label,
                                                error,
                                                icon,
                                                helpText,
                                                multiline = false,
                                                rows = 3,
                                                className = '',
                                                ...props
                                            }, ref) => {
    const Component = multiline ? 'textarea' : 'input';

    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-secondary-700">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && !multiline && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-secondary-400">{icon}</span>
                    </div>
                )}
                <Component
                    ref={ref as any}
                    className={`w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-surface text-lg ${
                        error ? 'border-error-500 focus:ring-error-500' : ''
                    } ${icon && !multiline ? 'pl-12' : ''} ${className}`}
                    {...(multiline ? { rows } : {})}
                    {...props}
                />
            </div>
            {helpText && !error && (
                <p className="text-xs text-secondary-500">{helpText}</p>
            )}
            {error && (
                <p className="text-sm text-error-600">{error}</p>
            )}
        </div>
    );
});
