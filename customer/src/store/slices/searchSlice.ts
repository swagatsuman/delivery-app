import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { SearchState, SearchResults, SearchFilters } from '../../types';
import { restaurantService } from '../../services/restaurantService';

const initialState: SearchState = {
    query: '',
    results: {
        restaurants: [],
        dishes: [],
        categories: []
    },
    recentSearches: JSON.parse(localStorage.getItem('recentSearches') || '[]'),
    loading: false,
    error: null,
    filters: {
        sortBy: 'relevance',
        cuisines: [],
        priceRange: [0, 1000],
        rating: 0,
        deliveryTime: 0,
        offers: false
    }
};

// Search all
export const searchAll = createAsyncThunk(
    'search/searchAll',
    async (query: string) => {
        const response = await restaurantService.searchAll(query);
        return { query, results: response };
    }
);

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        clearResults: (state) => {
            state.results = initialState.results;
            state.query = '';
        },
        addRecentSearch: (state, action: PayloadAction<string>) => {
            const search = action.payload.trim();
            if (search && !state.recentSearches.includes(search)) {
                state.recentSearches.unshift(search);
                state.recentSearches = state.recentSearches.slice(0, 10);
                localStorage.setItem('recentSearches', JSON.stringify(state.recentSearches));
            }
        },
        removeRecentSearch: (state, action: PayloadAction<string>) => {
            state.recentSearches = state.recentSearches.filter(s => s !== action.payload);
            localStorage.setItem('recentSearches', JSON.stringify(state.recentSearches));
        },
        clearRecentSearches: (state) => {
            state.recentSearches = [];
            localStorage.removeItem('recentSearches');
        },
        updateFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
            state.filters = { ...state.filters, ...action.payload };
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchAll.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchAll.fulfilled, (state, action) => {
                state.loading = false;
                state.query = action.payload.query;
                state.results = action.payload.results;
            })
            .addCase(searchAll.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Search failed';
            });
    }
});

export const {
    clearResults,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    updateFilters
} = searchSlice.actions;

export default searchSlice.reducer;
