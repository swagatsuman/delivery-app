import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { UserFilters } from '../../types';
import { deliveryAgentService } from '../../services/deliveryAgentService';

const initialState = {
    deliveryAgents: [],
    selectedDeliveryAgent: null,
    loading: false,
    error: null,
    filters: {
        status: 'all',
        search: '',
        vehicleType: 'all'
    },
    pagination: {
        page: 1,
        limit: 20,
        total: 0
    }
};

export const fetchDeliveryAgents = createAsyncThunk(
    'deliveryAgents/fetchDeliveryAgents',
    async (params?: { filters?: UserFilters; page?: number; limit?: number }) => {
        const response = await deliveryAgentService.getDeliveryAgents(params);
        return response;
    }
);

export const fetchDeliveryAgentDetails = createAsyncThunk(
    'deliveryAgents/fetchDetails',
    async (id: string) => {
        const response = await deliveryAgentService.getDeliveryAgentDetails(id);
        return response;
    }
);

export const updateDeliveryAgentStatus = createAsyncThunk(
    'deliveryAgents/updateStatus',
    async ({ uid, status }: { uid: string; status: string }) => {
        await deliveryAgentService.updateDeliveryAgentStatus(uid, status);
        return { uid, status };
    }
);

const deliveryAgentSlice = createSlice({
    name: 'deliveryAgents',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<Partial<UserFilters>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setPagination: (state, action: PayloadAction<{ page?: number; limit?: number }>) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedDeliveryAgent: (state) => {
            state.selectedDeliveryAgent = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Delivery Agents
            .addCase(fetchDeliveryAgents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDeliveryAgents.fulfilled, (state, action) => {
                state.loading = false;
                state.deliveryAgents = action.payload.deliveryAgents;
                state.pagination.total = action.payload.total;
            })
            .addCase(fetchDeliveryAgents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch delivery agents';
            })
            // Fetch Delivery Agent Details
            .addCase(fetchDeliveryAgentDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDeliveryAgentDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedDeliveryAgent = action.payload;
            })
            .addCase(fetchDeliveryAgentDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch delivery agent details';
            })
            // Update Delivery Agent Status
            .addCase(updateDeliveryAgentStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateDeliveryAgentStatus.fulfilled, (state, action) => {
                state.loading = false;
                const { uid, status } = action.payload;

                // Update in delivery agents list
                const agent = state.deliveryAgents.find(a => a.uid === uid);
                if (agent) {
                    agent.status = status as any;
                }

                // Update selected delivery agent if it's the same one
                if (state.selectedDeliveryAgent && state.selectedDeliveryAgent.uid === uid) {
                    state.selectedDeliveryAgent.status = status as any;
                }
            })
            .addCase(updateDeliveryAgentStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update delivery agent status';
            });
    }
});

export const { setFilters, setPagination, clearError, clearSelectedDeliveryAgent } = deliveryAgentSlice.actions;
export default deliveryAgentSlice.reducer;
