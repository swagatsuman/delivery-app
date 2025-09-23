import React from 'react';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
                                                  checked,
                                                  onChange,
                                                  disabled = false
                                              }) => {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                checked ? 'bg-primary-500' : 'bg-secondary-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    );
};
