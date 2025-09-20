import React from 'react';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
                                                  checked,
                                                  onChange,
                                                  label,
                                                  description,
                                                  disabled = false
                                              }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex-1">
                {label && (
                    <label className="text-sm font-medium text-secondary-900">
                        {label}
                    </label>
                )}
                {description && (
                    <p className="text-sm text-secondary-500">{description}</p>
                )}
            </div>
            <button
                type="button"
                className={`${
                    checked ? 'bg-primary-600' : 'bg-secondary-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => !disabled && onChange(!checked)}
                disabled={disabled}
            >
        <span
            className={`${
                checked ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
            </button>
        </div>
    );
};
