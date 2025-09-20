import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RestaurantState, RestaurantFilters } from '../../types';
import { restaurantService } from '../../services/restaurantService';

const initialState: RestaurantState = {
    restaurants: [],
    selectedRestaurant: null,
    loading: false,
    error: null,
    filters: {
        status: 'all',
        search: '',
        cuisine: '',
        rating: null
    },
    pagination: {
        page: 1,
        limit: 20,
        total: 0
    }
};

export const fetchRestaurants = createAsyncThunk(
    'restaurants/fetchRestaurants',
    async (params?: { filters?: RestaurantFilters; page?: number; limit?: number }) => {
        const response = await restaurantService.getRestaurants(params);
        return response;
    }
);

export const updateRestaurantStatus = createAsyncThunk(
    'restaurants/updateStatus',
    async ({ uid, status }: { uid: string; status: string }) => {
        await restaurantService.updateRestaurantStatus(uid, status);
        return { uid, status };
    }
);

export const fetchRestaurantDetails = createAsyncThunk(
    'restaurants/fetchDetails',
    async (id: string) => {
        const response = await restaurantService.getRestaurantDetails(id);
        return response;
    }
);

const restaurantSlice = createSlice({
    name: 'restaurants',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<Partial<RestaurantFilters>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setPagination: (state, action: PayloadAction<{ page?: number; limit?: number }>) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedRestaurant: (state) => {
            state.selectedRestaurant = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Restaurants
            .addCase(fetchRestaurants.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRestaurants.fulfilled, (state, action) => {
                state.loading = false;
                state.restaurants = action.payload.restaurants;
                state.pagination.total = action.payload.total;
            })
            .addCase(fetchRestaurants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch restaurants';
            })
            // Update Restaurant Status
            .addCase(updateRestaurantStatus.fulfilled, (state, action) => {
                const { uid, status } = action.payload;
                const restaurant = state.restaurants.find(r => r.uid === uid);
                if (restaurant) {
                    restaurant.status = status as any;
                }
            })
            // Fetch Restaurant Details
            .addCase(fetchRestaurantDetails.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRestaurantDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedRestaurant = action.payload;
            })
            .addCase(fetchRestaurantDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch restaurant details';
            });
    }
});

export const { setFilters, setPagination, clearError, clearSelectedRestaurant } = restaurantSlice.actions;
export default restaurantSlice.reducer;
