import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { OrderState, Order, OrderFilters } from '../../types';
import { orderService } from '../../services/orderService';

const initialState: OrderState = {
    availableOrders: [],
    assignedOrders: [],
    completedOrders: [],
    selectedOrder: null,
    loading: false,
    error: null,
    filters: {
        status: 'all',
        dateRange: 'today',
        distance: 10
    }
};

export const fetchAvailableOrders = createAsyncThunk(
    'orders/fetchAvailable',
    async (location: { lat: number; lng: number }) => {
        const response = await orderService.getAvailableOrders(location);
        return response;
    }
);

export const fetchAssignedOrders = createAsyncThunk(
    'orders/fetchAssigned',
    async (agentId: string) => {
        const response = await orderService.getAssignedOrders(agentId);
        return response;
    }
);

export const fetchCompletedOrders = createAsyncThunk(
    'orders/fetchCompleted',
    async ({ agentId, filters }: { agentId: string; filters?: OrderFilters }) => {
        const response = await orderService.getCompletedOrders(agentId, filters);
        return response;
    }
);

export const acceptOrder = createAsyncThunk(
    'orders/accept',
    async ({ orderId, agentId }: { orderId: string; agentId: string }) => {
        await orderService.acceptOrder(orderId, agentId);
        return orderId;
    }
);

export const updateOrderStatus = createAsyncThunk(
    'orders/updateStatus',
    async ({ orderId, status, note, location }: {
        orderId: string;
        status: string;
        note?: string;
        location?: { lat: number; lng: number };
    }) => {
        await orderService.updateOrderStatus(orderId, status, note, location);
        return { orderId, status, note };
    }
);

export const fetchOrderDetails = createAsyncThunk(
    'orders/fetchDetails',
    async (orderId: string) => {
        const response = await orderService.getOrderDetails(orderId);
        return response;
    }
);

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<Partial<OrderFilters>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Available Orders
            .addCase(fetchAvailableOrders.fulfilled, (state, action) => {
                state.availableOrders = action.payload;
            })
            // Fetch Assigned Orders
            .addCase(fetchAssignedOrders.fulfilled, (state, action) => {
                state.assignedOrders = action.payload;
            })
            // Fetch Completed Orders
            .addCase(fetchCompletedOrders.fulfilled, (state, action) => {
                state.completedOrders = action.payload;
            })
            // Accept Order
            .addCase(acceptOrder.fulfilled, (state, action) => {
                state.availableOrders = state.availableOrders.filter(
                    order => order.id !== action.payload
                );
            })
            // Update Order Status
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const { orderId, status } = action.payload;
                const orderIndex = state.assignedOrders.findIndex(order => order.id === orderId);
                if (orderIndex !== -1) {
                    state.assignedOrders[orderIndex].status = status as any;
                }
            })
            // Fetch Order Details
            .addCase(fetchOrderDetails.fulfilled, (state, action) => {
                state.selectedOrder = action.payload;
            })
            // Loading states
            .addMatcher(
                (action) => action.type.endsWith('/pending'),
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.loading = false;
                    state.error = action.error.message || 'An error occurred';
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/fulfilled'),
                (state) => {
                    state.loading = false;
                }
            );
    }
});

export const { setFilters, clearError } = orderSlice.actions;
export default orderSlice.reducer;
