import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DashboardState } from '../../types';
import { dashboardService } from '../../services/dashboardService';

const initialState: DashboardState = {
    stats: null,
    recentOrders: [],
    chartData: [],
    loading: false,
    error: null
};

export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async (restaurantId: string) => {
        const response = await dashboardService.getDashboardStats(restaurantId);
        return response;
    }
);

export const fetchRecentOrders = createAsyncThunk(
    'dashboard/fetchRecentOrders',
    async (restaurantId: string) => {
        const response = await dashboardService.getRecentOrders(restaurantId);
        return response;
    }
);

export const fetchChartData = createAsyncThunk(
    'dashboard/fetchChartData',
    async ({ restaurantId, timeRange }: { restaurantId: string; timeRange: string }) => {
        const response = await dashboardService.getChartData(restaurantId, timeRange);
        return response;
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Dashboard Stats
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch dashboard stats';
            })
            // Fetch Recent Orders
            .addCase(fetchRecentOrders.fulfilled, (state, action) => {
                state.recentOrders = action.payload;
            })
            // Fetch Chart Data
            .addCase(fetchChartData.fulfilled, (state, action) => {
                state.chartData = action.payload;
            });
    }
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
