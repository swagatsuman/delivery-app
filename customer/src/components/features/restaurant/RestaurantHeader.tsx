import React from 'react';
import { Star, Clock, Truck, Heart } from 'lucide-react';
import type { Restaurant } from '../../../types';

interface RestaurantHeaderProps {
    restaurant: Restaurant;
}

export const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({ restaurant }) => {
    return (
        <div className="bg-surface">
            {/* Restaurant Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={restaurant.images[0]}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Favorite Button */}
                <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full">
                    <Heart className="h-5 w-5 text-secondary-600" />
                </button>
            </div>

            {/* Restaurant Info */}
            <div className="p-4">
                <h1 className="text-xl font-bold text-secondary-900 mb-2">
                    {restaurant.name}
                </h1>

                <p className="text-secondary-600 text-sm mb-3 line-clamp-2">
                    {restaurant.description}
                </p>

                {/* Rating & Info */}
                <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-secondary-900">
              {restaurant.rating.toFixed(1)}
            </span>
                        <span className="text-xs text-secondary-600">
              ({restaurant.totalRatings})
            </span>
                    </div>

                    <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-secondary-500" />
                        <span className="text-sm text-secondary-600">
              {restaurant.deliveryTime}
            </span>
                    </div>

                    <div className="flex items-center space-x-1">
                        <Truck className="h-4 w-4 text-secondary-500" />
                        <span className="text-sm text-secondary-600">
              ₹{restaurant.deliveryFee === 0 ? 'Free' : restaurant.deliveryFee}
            </span>
                    </div>
                </div>

                {/* Cuisines */}
                <div className="flex flex-wrap gap-1">
                    {restaurant.cuisineTypes.slice(0, 3).map((cuisine) => (
                        <span
                            key={cuisine}
                            className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-lg"
                        >
              {cuisine}
            </span>
                    ))}
                    {restaurant.cuisineTypes.length > 3 && (
                        <span className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-lg">
              +{restaurant.cuisineTypes.length - 3} more
            </span>
                    )}
                </div>

                {/* Minimum Order */}
                {restaurant.minimumOrder > 0 && (
                    <div className="mt-3 p-2 bg-warning-50 border border-warning-200 rounded-lg">
                        <p className="text-sm text-warning-800">
                            Minimum order: ₹{restaurant.minimumOrder}
                        </p>
                    </div>
                )}

                {/* Offers */}
                {restaurant.offers && restaurant.offers.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {restaurant.offers.slice(0, 2).map((offer) => (
                            <div key={offer.id} className="p-2 bg-primary-50 border border-primary-200 rounded-lg">
                                <p className="text-sm font-medium text-primary-800">
                                    {offer.title}
                                </p>
                                <p className="text-xs text-primary-600">
                                    {offer.description}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
