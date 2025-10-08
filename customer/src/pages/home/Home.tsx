import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocationHeader } from '../../components/features/home/LocationHeader';
import { SearchBar } from '../../components/features/home/SearchBar';
import { OffersBanner } from '../../components/features/home/OffersBanner';
import { CategoryList } from '../../components/features/home/CategoryList';
import { RestaurantCard } from '../../components/features/home/RestaurantCard';
import { Loading } from '../../components/ui/Loading';
import { Button } from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { fetchNearbyRestaurants, fetchCategories } from '../../store/slices/restaurantSlice';
import { fetchAddresses, initializeLocation } from '../../store/slices/locationSlice';
import { fetchOrders } from '../../store/slices/orderSlice';
import type { Restaurant, Category } from '../../types';

const Home: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {currentLocation, loading: locationLoading} = useAppSelector(state => state.location);
    const {nearbyRestaurants, categories, loading} = useAppSelector(state => state.restaurant);
    const {user} = useAppSelector(state => state.auth);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [locationInitialized, setLocationInitialized] = useState(false);

    // Initialize location if not available
    useEffect(() => {
        if (user && !currentLocation && !locationInitialized) {
            console.log('Home: Initializing location for user:', user.uid);
            setLocationInitialized(true);
            dispatch(initializeLocation(user.uid))
                .unwrap()
                .catch((error) => {
                    console.error('Home: Failed to initialize location:', error);
                });
        }
    }, [user, currentLocation, locationInitialized, dispatch]);

    useEffect(() => {
        if (currentLocation && currentLocation.coordinates) {
            console.log('Home: Fetching data for location:', currentLocation.label);
            dispatch(fetchNearbyRestaurants(currentLocation.coordinates));
            dispatch(fetchCategories());
        }
    }, [currentLocation, dispatch]);

    // Fetch orders when user is available (for active order footer)
    useEffect(() => {
        if (user?.uid) {
            dispatch(fetchOrders(user.uid));
        }
    }, [user, dispatch]);

    const handleRestaurantClick = (restaurant: Restaurant) => {
        navigate(`/restaurant/${restaurant.id}`);
    };

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId);
    };

    const handleSearchClick = () => {
        navigate('/search');
    };

    const handleSetLocation = () => {
        navigate('/addresses');
    };

    const filteredRestaurants = selectedCategory === 'all'
        ? nearbyRestaurants
        : nearbyRestaurants.filter(restaurant =>
            restaurant.cuisineTypes.some(cuisine =>
                categories.find(cat => cat.id === selectedCategory)?.name.toLowerCase().includes(cuisine.toLowerCase())
            )
        );

    // Show location setup screen if no location is set
    if (!currentLocation && !locationLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                {/* Header */}
                <div className="bg-primary-500 text-white px-4 py-6">
                    <h1 className="text-2xl font-bold">FoodEats</h1>
                    <p className="text-primary-100">Order your favorite food</p>
                </div>

                {/* Location Required Content */}
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center max-w-md">
                        <div
                            className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">📍</span>
                        </div>
                        <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                            Location Required
                        </h2>
                        <p className="text-secondary-600 mb-8">
                            Please set your location to see nearby restaurants and start ordering delicious food
                        </p>
                        <Button
                            onClick={handleSetLocation}
                            className="w-full h-12 text-lg"
                        >
                            Set Your Location
                        </Button>
                        <p className="text-sm text-secondary-500 mt-4">
                            We use your location to find restaurants that deliver to your area
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Show loading while location is being set up
    if (locationLoading || !currentLocation) {
        return <Loading fullScreen text="Setting up your location..."/>;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Location Header */}
            <LocationHeader/>

            {/* Search Bar */}
            <div className="px-4 pb-4">
                <SearchBar onClick={handleSearchClick}/>
            </div>

            {/* Offers Banner */}
            <div className="px-4 mb-6">
                <OffersBanner/>
            </div>

            {/* Categories */}
            <div className="mb-6">
                <div className="px-4 mb-4">
                    <h2 className="text-lg font-semibold text-secondary-900">
                        What's on your mind?
                    </h2>
                </div>
                <CategoryList
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    loading={loading}
                />
            </div>

            {/* Restaurants */}
            <div className="px-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-secondary-900">
                        {selectedCategory === 'all' ? 'Restaurants near you' : `${categories.find(c => c.id === selectedCategory)?.name} restaurants`}
                    </h2>
                    <span className="text-sm text-secondary-600">
            {filteredRestaurants.length} restaurants
          </span>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {Array.from({length: 5}).map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="bg-secondary-200 h-48 rounded-xl mb-3"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredRestaurants.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🍽️</div>
                        <h3 className="text-lg font-medium text-secondary-900 mb-2">
                            No restaurants found
                        </h3>
                        <p className="text-secondary-600 mb-4">
                            No restaurants available in your area yet
                        </p>
                        <Button
                            onClick={handleSetLocation}
                            variant="secondary"
                        >
                            Change Location
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 pb-4">
                        {filteredRestaurants.map((restaurant) => (
                            <RestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                                onClick={handleRestaurantClick}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
