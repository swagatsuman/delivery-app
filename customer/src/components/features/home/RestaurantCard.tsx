import React from 'react';
import { Star, Clock, Truck, Heart } from 'lucide-react';
import type { Restaurant } from '../../../types';

interface RestaurantCardProps {
    restaurant: Restaurant;
    onClick: (restaurant: Restaurant) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
                                                                  restaurant,
                                                                  onClick
                                                              }) => {
    return (
        <div
            onClick={() => onClick(restaurant)}
            className="bg-surface rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
        >
            {/* Restaurant Image */}
            <div className="relative h-48">
                <img
                    src={restaurant.images[0]}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                />

                {/* Offers Badge */}
                {restaurant.offers && restaurant.offers.length > 0 && (
                    <div className="absolute top-3 left-3">
            <span className="bg-primary-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              {restaurant.offers[0].title}
            </span>
                    </div>
                )}

                {/* Favorite Button */}
                <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                    <Heart className="h-4 w-4 text-secondary-600" />
                </button>

                {/* Delivery Time */}
                <div className="absolute bottom-3 right-3 bg-white/90 px-2 py-1 rounded-md">
          <span className="text-xs font-medium text-secondary-900">
            {restaurant.deliveryTime}
          </span>
                </div>

                {/* Open/Closed Status */}
                <div className={`absolute bottom-3 left-3 px-2 py-1 rounded-md text-xs font-medium ${
                    restaurant.isOpen
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                }`}>
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                </div>
            </div>

            {/* Restaurant Details */}
            <div className="p-4">
                <h3 className="font-semibold text-secondary-900 mb-1 text-lg">
                    {restaurant.name}
                </h3>

                {/* Cuisines */}
                <p className="text-secondary-600 text-sm mb-2">
                    {restaurant.cuisineTypes.slice(0, 3).join(', ')}
                    {restaurant.cuisineTypes.length > 3 && ' & more'}
                </p>

                {/* Rating, Time, Delivery */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Rating */}
                        <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium text-secondary-900">
                {restaurant.rating.toFixed(1)}
              </span>
                            <span className="text-xs text-secondary-600">
                ({restaurant.totalRatings})
              </span>
                        </div>

                        {/* Delivery Fee */}
                        <div className="flex items-center space-x-1">
                            <Truck className="h-4 w-4 text-secondary-500" />
                            <span className="text-sm text-secondary-600">
                {restaurant.deliveryFee === 0 ? 'Free' : `₹${restaurant.deliveryFee}`}
              </span>
                        </div>
                    </div>

                    {/* Distance */}
                    {restaurant.distance && (
                        <span className="text-xs text-secondary-500">
              {restaurant.distance.toFixed(1)} km
            </span>
                    )}
                </div>

                {/* Minimum Order */}
                {restaurant.minimumOrder > 0 && (
                    <div className="mt-2 text-xs text-secondary-600">
                        Min order: ₹{restaurant.minimumOrder}
                    </div>
                )}
            </div>
        </div>
    );
};
