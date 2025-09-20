import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
                                                    size = 'md',
                                                    text = 'Loading...',
                                                    fullScreen = false
                                                }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8'
    };

    const content = (
        <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className={`animate-spin text-primary-500 ${sizeClasses[size]}`} />
            {text && <p className="text-sm text-secondary-600">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-8">
            {content}
        </div>
    );
};
