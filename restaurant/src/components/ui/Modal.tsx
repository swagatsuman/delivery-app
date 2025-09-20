import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
                                                isOpen,
                                                onClose,
                                                title,
                                                children,
                                                size = 'md',
                                                showCloseButton = true
                                            }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-secondary-500 opacity-75" onClick={onClose}></div>
                </div>

                <div className={`inline-block align-bottom bg-surface rounded-xl px-6 pt-5 pb-4 text-left overflow-hidden shadow-swiggy-lg transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} sm:w-full sm:p-6`}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
                        {showCloseButton && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                icon={<X className="h-4 w-4" />}
                            />
                        )}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};
