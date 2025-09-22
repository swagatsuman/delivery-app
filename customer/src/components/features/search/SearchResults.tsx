import React from 'react';
import { RestaurantCard } from '../home/RestaurantCard';
import { EmptyState } from '../../common/EmptyState';
import type { Restaurant, MenuItem } from '../../../types';

interface SearchResultsProps {
    restaurants: Restaurant[];
    dishes: MenuItem[];
    activeTab: 'restaurants' | 'dishes';
    onTabChange: (tab: 'restaurants' | 'dishes') => void;
    onRestaurantClick: (restaurant: Restaurant) => void;
    onDishClick: (dish: MenuItem) => void;
    loading?: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
                                                                restaurants,
                                                                dishes,
                                                                activeTab,
                                                                onTabChange,
                                                                onRestaurantClick,
                                                                onDishClick,
                                                                loading = false
                                                            }) => {
    if (loading) {
        return (
            <div className="p-4">
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="bg-secondary-200 h-32 rounded-lg mb-3"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                                <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Tabs */}
            <div className="border-b border-secondary-200 bg-surface">
                <div className="flex">
                    <button
                        onClick={() => onTabChange('restaurants')}
                        className={`flex-1 py-3 text-center font-medium ${
                            activeTab === 'restaurants'
                                ? 'text-primary-600 border-b-2 border-primary-600'
                                : 'text-secondary-600'
                        }`}
                    >
                        Restaurants ({restaurants.length})
                    </button>
                    <button
                        onClick={() => onTabChange('dishes')}
                        className={`flex-1 py-3 text-center font-medium ${
                            activeTab === 'dishes'
                                ? 'text-primary-600 border-b-2 border-primary-600'
                                : 'text-secondary-600'
                        }`}
                    >
                        Dishes ({dishes.length})
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className="p-4">
                {activeTab === 'restaurants' ? (
                    restaurants.length === 0 ? (
                        <EmptyState
                            icon="🔍"
                            title="No restaurants found"
                            description="Try searching with different keywords or adjust your filters"
                        />
                    ) : (
                        <div className="space-y-4">
                            {restaurants.map(restaurant => (
                                <RestaurantCard
                                    key={restaurant.id}
                                    restaurant={restaurant}
                                    onClick={onRestaurantClick}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    dishes.length === 0 ? (
                        <EmptyState
                            icon="🍽️"
                            title="No dishes found"
                            description="Try searching with different keywords or browse restaurants"
                        />
                    ) : (
                        <div className="space-y-4">
                            {dishes.map(dish => (
                                <button
                                    key={dish.id}
                                    onClick={() => onDishClick(dish)}
                                    className="w-full p-4 bg-surface border border-secondary-200 rounded-xl text-left hover:bg-secondary-50 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-secondary-900 mb-1">
                                                {dish.name}
                                            </h3>
                                            <p className="text-sm text-secondary-600 mb-2 line-clamp-2">
                                                {dish.description}
                                            </p>
                                            <div className="flex items-center space-x-2">
                        <span className="font-semibold text-secondary-900">
                          ₹{dish.price}
                        </span>
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    dish.type === 'veg' ? 'bg-green-100 text-green-800' :
                                                        dish.type === 'non-veg' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                }`}>
                          {dish.type === 'veg' ? '🟢 Veg' :
                              dish.type === 'non-veg' ? '🔴 Non-Veg' : '🟡 Egg'}
                        </span>
                                            </div>
                                        </div>
                                        {dish.images.length > 0 && (
                                            <img
                                                src={dish.images[0]}
                                                alt={dish.name}
                                                className="w-16 h-16 object-cover rounded-lg ml-4"
                                            />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};
