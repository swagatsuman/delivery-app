import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DashboardState, DashboardStats, EarningsData } from '../../types';
import { dashboardService } from '../../services/dashboardService';

const initialState: DashboardState = {
    stats: null,
    recentOrders: [],
    earnings: [],
    loading: false,
    error: null
};

export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async (agentId: string) => {
        const response = await dashboardService.getDashboardStats(agentId);
        return response;
    }
);

export const fetchRecentDeliveries = createAsyncThunk(
    'dashboard/fetchRecentDeliveries',
    async (agentId: string) => {
        const response = await dashboardService.getRecentDeliveries(agentId);
        return response;
    }
);

export const fetchEarningsData = createAsyncThunk(
    'dashboard/fetchEarnings',
    async ({ agentId, timeRange }: { agentId: string; timeRange: string }) => {
        const response = await dashboardService.getEarningsData(agentId, timeRange);
        return response;
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
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

            // Fetch Recent Deliveries
            .addCase(fetchRecentDeliveries.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRecentDeliveries.fulfilled, (state, action) => {
                state.loading = false;
                state.recentOrders = action.payload;
            })
            .addCase(fetchRecentDeliveries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch recent deliveries';
            })

            // Fetch Earnings Data
            .addCase(fetchEarningsData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEarningsData.fulfilled, (state, action) => {
                state.loading = false;
                state.earnings = action.payload;
            })
            .addCase(fetchEarningsData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch earnings data';
            });
    }
});

export const { clearError, setLoading } = dashboardSlice.actions;
export default dashboardSlice.reducer;
