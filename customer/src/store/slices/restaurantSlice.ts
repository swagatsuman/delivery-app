import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Restaurant, Category, MenuCategory, Coordinates } from '../../types';
import { restaurantService } from '../../services/restaurantService';

interface RestaurantState {
    nearbyRestaurants: Restaurant[];
    restaurants: Restaurant[];
    categories: Category[];
    selectedRestaurant: Restaurant | null;
    menu: MenuCategory[];
    loading: boolean;
    error: string | null;
}

const initialState: RestaurantState = {
    nearbyRestaurants: [],
    restaurants: [],
    categories: [],
    selectedRestaurant: null,
    menu: [],
    loading: false,
    error: null
};

// Fetch nearby restaurants
export const fetchNearbyRestaurants = createAsyncThunk(
    'restaurant/fetchNearby',
    async (coordinates: Coordinates) => {
        const response = await restaurantService.getNearbyRestaurants(coordinates);
        return response;
    }
);

// Fetch categories
export const fetchCategories = createAsyncThunk(
    'restaurant/fetchCategories',
    async () => {
        const response = await restaurantService.getCategories();
        return response;
    }
);

// Fetch restaurant details
export const fetchRestaurantDetails = createAsyncThunk(
    'restaurant/fetchDetails',
    async (restaurantId: string) => {
        const response = await restaurantService.getRestaurantDetails(restaurantId);
        return response;
    }
);

// Fetch restaurant menu
export const fetchRestaurantMenu = createAsyncThunk(
    'restaurant/fetchMenu',
    async (restaurantId: string) => {
        const response = await restaurantService.getRestaurantMenu(restaurantId);
        return response;
    }
);

const restaurantSlice = createSlice({
    name: 'restaurant',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedRestaurant: (state) => {
            state.selectedRestaurant = null;
            state.menu = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Nearby Restaurants
            .addCase(fetchNearbyRestaurants.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNearbyRestaurants.fulfilled, (state, action) => {
                state.loading = false;
                state.nearbyRestaurants = action.payload;
                state.restaurants = action.payload; // Also update restaurants array
            })
            .addCase(fetchNearbyRestaurants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch restaurants';
            })
            // Fetch Categories
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            })
            // Fetch Restaurant Details
            .addCase(fetchRestaurantDetails.fulfilled, (state, action) => {
                state.selectedRestaurant = action.payload;
            })
            // Fetch Restaurant Menu
            .addCase(fetchRestaurantMenu.fulfilled, (state, action) => {
                state.menu = action.payload;
            });
    }
});

export const {clearError, clearSelectedRestaurant} = restaurantSlice.actions;
export default restaurantSlice.reducer;
