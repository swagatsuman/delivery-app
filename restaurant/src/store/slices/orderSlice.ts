import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { OrderState, Order, OrderFilters } from '../../types';
import { orderService } from '../../services/orderService';

const initialState: OrderState = {
    orders: [],
    selectedOrder: null,
    loading: false,
    error: null,
    realTimeEnabled: false,
    filters: {
        status: 'all',
        dateRange: 'today',
        search: ''
    }
};

export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async ({ restaurantId, filters }: { restaurantId: string; filters?: OrderFilters }) => {
        const response = await orderService.getOrders(restaurantId, filters);
        return response;
    }
);

export const updateOrderStatus = createAsyncThunk(
    'orders/updateStatus',
    async ({ orderId, status, note }: { orderId: string; status: string; note?: string }) => {
        await orderService.updateOrderStatus(orderId, status, note);
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
        setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
            state.selectedOrder = action.payload;
        },
        setRealTimeEnabled: (state, action: PayloadAction<boolean>) => {
            state.realTimeEnabled = action.payload;
        },
        addOrder: (state, action: PayloadAction<Order>) => {
            state.orders.unshift(action.payload);
        },
        updateOrder: (state, action: PayloadAction<Order>) => {
            const index = state.orders.findIndex(order => order.id === action.payload.id);
            if (index !== -1) {
                state.orders[index] = action.payload;
            }
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Orders
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch orders';
            })
            // Update Order Status
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const { orderId, status, note } = action.payload;
                const orderIndex = state.orders.findIndex(order => order.id === orderId);
                if (orderIndex !== -1) {
                    state.orders[orderIndex].status = status as any;
                    state.orders[orderIndex].timeline.push({
                        status: status as any,
                        timestamp: new Date(),
                        note
                    });
                }
            })
            // Fetch Order Details
            .addCase(fetchOrderDetails.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOrderDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedOrder = action.payload;
            })
            .addCase(fetchOrderDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch order details';
            });
    }
});

export const {
    setFilters,
    setSelectedOrder,
    setRealTimeEnabled,
    addOrder,
    updateOrder,
    clearError
} = orderSlice.actions;
export default orderSlice.reducer;
