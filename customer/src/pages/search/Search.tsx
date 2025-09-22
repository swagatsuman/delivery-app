import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Filter, Clock, ArrowLeft } from 'lucide-react';
import { RestaurantCard } from '../../components/features/home/RestaurantCard';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { searchAll, addRecentSearch, clearResults } from '../../store/slices/searchSlice';
import type { Restaurant, MenuItem, SearchFilters } from '../../types';

const Search: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {query, results, recentSearches, loading, filters} = useAppSelector(state => state.search);

    const [searchQuery, setSearchQuery] = useState(query);
    const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>('restaurants');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (searchQuery.trim() && searchQuery !== query) {
            const debounceTimer = setTimeout(() => {
                dispatch(searchAll(searchQuery));
            }, 300);

            return () => clearTimeout(debounceTimer);
        }
    }, [searchQuery, dispatch, query]);

    const handleSearch = (searchTerm: string) => {
        setSearchQuery(searchTerm);
        if (searchTerm.trim()) {
            dispatch(addRecentSearch(searchTerm));
        }
    };

    const handleRecentSearchClick = (search: string) => {
        setSearchQuery(search);
        dispatch(searchAll(search));
    };

    const handleRestaurantClick = (restaurant: Restaurant) => {
        navigate(`/restaurant/${restaurant.id}`);
    };

    const handleDishClick = (dish: MenuItem) => {
        navigate(`/restaurant/${dish.restaurantId}`);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        dispatch(clearResults());
    };

    const handleBack = () => {
        navigate(-1);
    };

    const sortOptions = [
        {value: 'relevance', label: 'Relevance'},
        {value: 'rating', label: 'Rating'},
        {value: 'delivery_time', label: 'Delivery Time'},
        {value: 'cost_low_to_high', label: 'Cost: Low to High'},
        {value: 'cost_high_to_low', label: 'Cost: High to Low'}
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-surface border-b border-secondary-200">
                <div className="flex items-center space-x-3 p-4">
                    <button
                        onClick={handleBack}
                        className="p-2 hover:bg-secondary-100 rounded-full"
                    >
                        <ArrowLeft className="h-5 w-5 text-secondary-700"/>
                    </button>

                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <SearchIcon
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400"/>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for restaurants, cuisines, dishes..."
                            className="w-full pl-10 pr-10 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Filter Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="p-2 hover:bg-secondary-100 rounded-full"
                    >
                        <Filter className="h-5 w-5 text-secondary-700"/>
                    </button>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="border-t border-secondary-200 p-4 space-y-4">
                        {/* Sort */}
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Sort by
                            </label>
                            <select className="w-full p-2 border border-secondary-300 rounded-lg">
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Quick Filters */}
                        <div className="flex flex-wrap gap-2">
                            <button className="px-3 py-1.5 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                                Fast Delivery
                            </button>
                            <button className="px-3 py-1.5 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                                Rating 4.0+
                            </button>
                            <button className="px-3 py-1.5 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                                Pure Veg
                            </button>
                            <button className="px-3 py-1.5 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                                Offers
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1">
                {!searchQuery ? (
                    /* Recent Searches */
                    <div className="p-4">
                        {recentSearches.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                                    Recent Searches
                                </h2>
                                <div className="space-y-2">
                                    {recentSearches.map((search, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleRecentSearchClick(search)}
                                            className="flex items-center space-x-3 w-full p-3 hover:bg-secondary-50 rounded-lg text-left"
                                        >
                                            <Clock className="h-4 w-4 text-secondary-400"/>
                                            <span className="text-secondary-700">{search}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Popular Searches */}
                        <div className="mt-8">
                            <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                                Popular on FoodEats
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                {['Pizza', 'Biryani', 'Burger', 'Chinese', 'South Indian', 'Ice Cream'].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => handleSearch(item)}
                                        className="p-3 bg-surface border border-secondary-200 rounded-lg text-left hover:bg-secondary-50"
                                    >
                                        <span className="text-secondary-700">{item}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : loading ? (
                    <Loading text="Searching..."/>
                ) : (
                    /* Search Results */
                    <div>
                        {/* Results Tabs */}
                        <div className="border-b border-secondary-200 bg-surface">
                            <div className="flex">
                                <button
                                    onClick={() => setActiveTab('restaurants')}
                                    className={`flex-1 py-3 text-center font-medium ${
                                        activeTab === 'restaurants'
                                            ? 'text-primary-600 border-b-2 border-primary-600'
                                            : 'text-secondary-600'
                                    }`}
                                >
                                    Restaurants ({results.restaurants.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('dishes')}
                                    className={`flex-1 py-3 text-center font-medium ${
                                        activeTab === 'dishes'
                                            ? 'text-primary-600 border-b-2 border-primary-600'
                                            : 'text-secondary-600'
                                    }`}
                                >
                                    Dishes ({results.dishes.length})
                                </button>
                            </div>
                        </div>

                        {/* Results Content */}
                        <div className="p-4">
                            {activeTab === 'restaurants' && (
                                <div>
                                    {results.restaurants.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="text-6xl mb-4">🔍</div>
                                            <h3 className="text-lg font-medium text-secondary-900 mb-2">
                                                No restaurants found
                                            </h3>
                                            <p className="text-secondary-600">
                                                Try searching for something else
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {results.restaurants.map((restaurant) => (
                                                <RestaurantCard
                                                    key={restaurant.id}
                                                    restaurant={restaurant}
                                                    onClick={handleRestaurantClick}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'dishes' && (
                                <div>
                                    {results.dishes.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="text-6xl mb-4">🍽️</div>
                                            <h3 className="text-lg font-medium text-secondary-900 mb-2">
                                                No dishes found
                                            </h3>
                                            <p className="text-secondary-600">
                                                Try searching for something else
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {results.dishes.map((dish) => (
                                                <button
                                                    key={dish.id}
                                                    onClick={() => handleDishClick(dish)}
                                                    className="w-full p-4 bg-surface border border-secondary-200 rounded-xl text-left hover:bg-secondary-50"
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
                                                                <span
                                                                    className="text-xs px-2 py-1 bg-secondary-100 text-secondary-700 rounded">
                                  {dish.type}
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
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
