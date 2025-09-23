import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
                                                                   label,
                                                                   error,
                                                                   icon,
                                                                   className = '',
                                                                   ...props
                                                               }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-secondary-700 mb-1">
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
                    ref={ref}
                    className={`input-field ${icon ? 'pl-10' : ''} ${error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-error-600">{error}</p>
            )}
        </div>
    );
});
