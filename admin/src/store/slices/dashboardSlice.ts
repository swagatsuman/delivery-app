import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DashboardState } from '../../types';
import { dashboardService } from '../../services/dashboardService';

const initialState: DashboardState = {
    stats: null,
    recentActivity: [],
    chartData: [],
    loading: false,
    error: null
};

export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async () => {
        const response = await dashboardService.getDashboardStats();
        return response;
    }
);

export const fetchRecentActivity = createAsyncThunk(
    'dashboard/fetchRecentActivity',
    async () => {
        const response = await dashboardService.getRecentActivity();
        return response;
    }
);

export const fetchChartData = createAsyncThunk(
    'dashboard/fetchChartData',
    async (timeRange: string) => {
        const response = await dashboardService.getChartData(timeRange);
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
            // Fetch Recent Activity
            .addCase(fetchRecentActivity.fulfilled, (state, action) => {
                state.recentActivity = action.payload;
            })
            // Fetch Chart Data
            .addCase(fetchChartData.fulfilled, (state, action) => {
                state.chartData = action.payload;
            });
    }
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
