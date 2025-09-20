import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    helpText?: string;
}

export const Input: React.FC<InputProps> = ({
                                                label,
                                                error,
                                                icon,
                                                helpText,
                                                className = '',
                                                ...props
                                            }) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-secondary-700">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-secondary-400">{icon}</span>
                    </div>
                )}
                <input
                    className={`input-field ${error ? 'border-error-500 focus:ring-error-500' : ''} ${
                        icon ? 'pl-10' : ''
                    } ${className}`}
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
};
