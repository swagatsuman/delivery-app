import React from 'react';
import { ArrowLeft, Share, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopHeaderProps {
    title?: string;
    showBack?: boolean;
    showShare?: boolean;
    showFavorite?: boolean;
    onBack?: () => void;
    onShare?: () => void;
    onFavorite?: () => void;
    rightElement?: React.ReactNode;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
                                                        title,
                                                        showBack = true,
                                                        showShare = false,
                                                        showFavorite = false,
                                                        onBack,
                                                        onShare,
                                                        onFavorite,
                                                        rightElement
                                                    }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="sticky top-0 z-50 bg-surface border-b border-secondary-200">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                    {showBack && (
                        <button
                            onClick={handleBack}
                            className="p-2 hover:bg-secondary-100 rounded-full mr-3"
                        >
                            <ArrowLeft className="h-6 w-6 text-secondary-700" />
                        </button>
                    )}
                    {title && (
                        <h1 className="text-lg font-semibold text-secondary-900">{title}</h1>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    {showFavorite && (
                        <button
                            onClick={onFavorite}
                            className="p-2 hover:bg-secondary-100 rounded-full"
                        >
                            <Heart className="h-5 w-5 text-secondary-600" />
                        </button>
                    )}
                    {showShare && (
                        <button
                            onClick={onShare}
                            className="p-2 hover:bg-secondary-100 rounded-full"
                        >
                            <Share className="h-5 w-5 text-secondary-600" />
                        </button>
                    )}
                    {rightElement}
                </div>
            </div>
        </div>
    );
};
