import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
    fullScreen?: boolean;
    text?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const Loading: React.FC<LoadingProps> = ({
                                                    fullScreen = false,
                                                    text = 'Loading...',
                                                    size = 'md'
                                                }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    const content = (
        <div className="flex flex-col items-center justify-center space-y-3">
            <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-500`} />
            <p className="text-secondary-600 text-sm">{text}</p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
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
