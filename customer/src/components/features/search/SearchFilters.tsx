import React from 'react';
import { Filter, X } from 'lucide-react';
import type { SearchFilters as SearchFiltersType } from '../../../types';

interface SearchFiltersProps {
    filters: SearchFiltersType;
    onFilterChange: (filters: Partial<SearchFiltersType>) => void;
    onClearFilters: () => void;
    isOpen: boolean;
    onToggle: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
                                                                filters,
                                                                onFilterChange,
                                                                onClearFilters,
                                                                isOpen,
                                                                onToggle
                                                            }) => {
    const cuisineOptions = [
        'North Indian', 'South Indian', 'Chinese', 'Italian', 'Mexican',
        'Continental', 'Thai', 'Japanese', 'Lebanese', 'Desserts'
    ];

    const sortOptions = [
        { value: 'relevance', label: 'Relevance' },
        { value: 'rating', label: 'Rating' },
        { value: 'delivery_time', label: 'Delivery Time' },
        { value: 'cost_low_to_high', label: 'Cost: Low to High' },
        { value: 'cost_high_to_low', label: 'Cost: High to Low' }
    ];

    const hasActiveFilters = filters.cuisines.length > 0 || filters.rating > 0 ||
        filters.deliveryTime > 0 || filters.offers || filters.sortBy !== 'relevance';

    return (
        <div className="border-b border-secondary-200">
            {/* Filter Toggle */}
            <div className="flex items-center justify-between p-4">
                <button
                    onClick={onToggle}
                    className="flex items-center space-x-2 text-secondary-700"
                >
                    <Filter className="h-5 w-5" />
                    <span>Filters</span>
                    {hasActiveFilters && (
                        <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
              {filters.cuisines.length + (filters.rating > 0 ? 1 : 0) +
                  (filters.deliveryTime > 0 ? 1 : 0) + (filters.offers ? 1 : 0)}
            </span>
                    )}
                </button>

                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="text-sm text-primary-600 hover:text-primary-700"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Filter Content */}
            {isOpen && (
                <div className="p-4 space-y-6 border-t border-secondary-200">
                    {/* Sort By */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Sort by
                        </label>
                        <select
                            value={filters.sortBy}
                            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
                            className="w-full p-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Cuisines */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Cuisines
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {cuisineOptions.map(cuisine => (
                                <button
                                    key={cuisine}
                                    onClick={() => {
                                        const newCuisines = filters.cuisines.includes(cuisine)
                                            ? filters.cuisines.filter(c => c !== cuisine)
                                            : [...filters.cuisines, cuisine];
                                        onFilterChange({ cuisines: newCuisines });
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-sm ${
                                        filters.cuisines.includes(cuisine)
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                                    }`}
                                >
                                    {cuisine}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Minimum Rating
                        </label>
                        <div className="flex space-x-2">
                            {[3, 3.5, 4, 4.5].map(rating => (
                                <button
                                    key={rating}
                                    onClick={() => onFilterChange({ rating: filters.rating === rating ? 0 : rating })}
                                    className={`px-3 py-1.5 rounded-lg text-sm ${
                                        filters.rating === rating
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                                    }`}
                                >
                                    {rating}+ ⭐
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Quick Filters
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => onFilterChange({ deliveryTime: filters.deliveryTime === 30 ? 0 : 30 })}
                                className={`px-3 py-1.5 rounded-full text-sm ${
                                    filters.deliveryTime === 30
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                                }`}
                            >
                                Fast Delivery (30 min)
                            </button>
                            <button
                                onClick={() => onFilterChange({ offers: !filters.offers })}
                                className={`px-3 py-1.5 rounded-full text-sm ${
                                    filters.offers
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                                }`}
                            >
                                Offers
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
