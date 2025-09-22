import React from 'react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
                                                          icon = '📦',
                                                          title,
                                                          description,
                                                          actionLabel,
                                                          onAction
                                                      }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
                {title}
            </h3>
            <p className="text-secondary-600 mb-6 max-w-sm">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};
