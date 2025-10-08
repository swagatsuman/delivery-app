import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share, Heart, Filter } from 'lucide-react';
import { RestaurantHeader } from '../../components/features/restaurant/RestaurantHeader';
import { MenuFilters } from '../../components/features/restaurant/MenuFilters';
import { MenuCategory } from '../../components/features/restaurant/MenuCategory';
import { FloatingButton } from '../../components/ui/FloatingButton';
import { Loading } from '../../components/ui/Loading';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { fetchRestaurantDetails, fetchRestaurantMenu } from '../../store/slices/restaurantSlice';
import { setRestaurantInfo } from '../../store/slices/cartSlice';
import { useCart } from '../../hooks/useCart';
import type { MenuFilters as MenuFiltersType } from '../../types';

const Restaurant: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {selectedRestaurant, menu, loading} = useAppSelector(state => state.restaurant);
    const {items: cartItems, restaurantId} = useAppSelector(state => state.cart);
    const {getTotalItems, getTotalAmount} = useCart();

    const [filters, setFilters] = useState<MenuFiltersType>({
        category: '',
        type: 'all',
        search: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>('');

    useEffect(() => {
        if (id) {
            dispatch(fetchRestaurantDetails(id));
            dispatch(fetchRestaurantMenu(id));
        }
    }, [id, dispatch]);

    // Update restaurant info in cart when restaurant is loaded
    useEffect(() => {
        if (selectedRestaurant && (restaurantId === selectedRestaurant.id || !restaurantId)) {
            dispatch(setRestaurantInfo(selectedRestaurant));
        }
    }, [selectedRestaurant, restaurantId, dispatch]);

    // Check if there are items from a different restaurant
    const hasDifferentRestaurantItems = restaurantId && restaurantId !== id && cartItems.length > 0;

    const handleBack = () => {
        navigate(-1);
    };

    const handleCartClick = () => {
        navigate('/cart');
    };

    const handleFilterChange = (newFilters: Partial<MenuFiltersType>) => {
        setFilters(prev => ({...prev, ...newFilters}));
    };

    const filteredMenu = menu.filter(category => {
        // Filter by category
        if (filters.category && category.id !== filters.category) {
            return false;
        }

        // Filter items within category
        const filteredItems = category.items.filter(item => {
            // Filter by type
            if (filters.type !== 'all' && item.type !== filters.type) {
                return false;
            }

            // Filter by search
            if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }

            return true;
        });

        return filteredItems.length > 0;
    }).map(category => ({
        ...category,
        items: category.items.filter(item => {
            // Apply same filters to items
            if (filters.type !== 'all' && item.type !== filters.type) {
                return false;
            }
            if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }
            return true;
        })
    }));

    if (loading || !selectedRestaurant) {
        return <Loading fullScreen/>;
    }

    const totalItems = getTotalItems();
    const totalAmount = getTotalAmount();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-surface border-b border-secondary-200">
                <div className="flex items-center justify-between p-4">
                    <button
                        onClick={handleBack}
                        className="p-2 hover:bg-secondary-100 rounded-full"
                    >
                        <ArrowLeft className="h-6 w-6 text-secondary-700"/>
                    </button>
                    <h1 className="text-lg font-semibold text-secondary-900 flex-1 mx-4 truncate">
                        {selectedRestaurant.name}
                    </h1>
                    <div className="flex space-x-2">
                        <button className="p-2 hover:bg-secondary-100 rounded-full">
                            <Heart className="h-5 w-5 text-secondary-600"/>
                        </button>
                        <button className="p-2 hover:bg-secondary-100 rounded-full">
                            <Share className="h-5 w-5 text-secondary-600"/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Restaurant Info */}
            <RestaurantHeader restaurant={selectedRestaurant}/>

            {/* Menu Filters */}
            <div className="sticky top-16 z-40 bg-surface border-b border-secondary-200">
                <MenuFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    categories={menu}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                />
            </div>

            {/* Different Restaurant Items Warning */}
            {hasDifferentRestaurantItems && (
                <div className="mx-4 mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                    <p className="text-sm text-warning-800">
                        Your cart contains items from a different restaurant. Adding items from this restaurant will
                        clear your current cart.
                    </p>
                </div>
            )}

            {/* Menu Categories */}
            <div className="pb-24">
                {filteredMenu.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🍽️</div>
                        <h3 className="text-lg font-medium text-secondary-900 mb-2">
                            No items found
                        </h3>
                        <p className="text-secondary-600">
                            Try adjusting your filters
                        </p>
                    </div>
                ) : (
                    filteredMenu.map((category) => (
                        <MenuCategory
                            key={category.id}
                            category={category}
                            restaurantId={selectedRestaurant.id}
                        />
                    ))
                )}
            </div>

            {/* Cart Button */}
            {totalItems > 0 && restaurantId === id && (
                <FloatingButton
                    onClick={handleCartClick}
                    className="fixed bottom-20 left-4 right-4 bg-primary-500 text-white"
                >
                    <div className="flex items-center justify-between w-full">
            <span className="flex items-center">
              <span className="bg-primary-400 text-white px-2 py-1 rounded mr-3 text-sm font-semibold">
                {totalItems}
              </span>
              View Cart
            </span>
                        <span className="font-semibold">
              ₹{totalAmount}
            </span>
                    </div>
                </FloatingButton>
            )}
        </div>
    );
};

export default Restaurant;
