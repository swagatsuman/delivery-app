import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helpText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
                                                      label,
                                                      error,
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
            <textarea
                className={`input-field ${error ? 'border-error-500 focus:ring-error-500' : ''} ${className}`}
                {...props}
            />
            {helpText && !error && (
                <p className="text-xs text-secondary-500">{helpText}</p>
            )}
            {error && (
                <p className="text-sm text-error-600">{error}</p>
            )}
        </div>
    );
};
