import React from 'react';

interface FloatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
                                                                  children,
                                                                  className = '',
                                                                  ...props
                                                              }) => {
    return (
        <button
            className={`fixed bottom-6 left-4 right-4 bg-primary-500 text-white p-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 active:scale-95 z-40 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
