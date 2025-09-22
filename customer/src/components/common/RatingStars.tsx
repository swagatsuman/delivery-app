import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
                                                            rating,
                                                            maxRating = 5,
                                                            size = 'md',
                                                            showValue = false,
                                                            interactive = false,
                                                            onRatingChange
                                                        }) => {
    const sizeClasses = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5'
    };

    const handleStarClick = (starRating: number) => {
        if (interactive && onRatingChange) {
            onRatingChange(starRating);
        }
    };

    return (
        <div className="flex items-center space-x-1">
            <div className="flex">
                {Array.from({ length: maxRating }, (_, index) => {
                    const starRating = index + 1;
                    const isFilled = starRating <= rating;
                    const isPartial = starRating - 0.5 <= rating && starRating > rating;

                    return (
                        <button
                            key={index}
                            type="button"
                            disabled={!interactive}
                            onClick={() => handleStarClick(starRating)}
                            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                        >
                            <Star
                                className={`${sizeClasses[size]} ${
                                    isFilled || isPartial
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                }`}
                            />
                        </button>
                    );
                })}
            </div>
            {showValue && (
                <span className="text-sm text-secondary-600 ml-1">
          {rating.toFixed(1)}
        </span>
            )}
        </div>
    );
};
