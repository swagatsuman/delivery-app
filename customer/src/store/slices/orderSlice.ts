import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { OrderState, Order, OrderRating } from '../../types';
import { orderService } from '../../services/orderService';

const initialState: OrderState = {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null
};

// Create order
export const createOrder = createAsyncThunk(
    'order/create',
    async (orderData: any) => {
        const response = await orderService.createOrder(orderData);
        return response;
    }
);

// Fetch user orders
export const fetchOrders = createAsyncThunk(
    'order/fetchOrders',
    async (userId: string) => {
        const response = await orderService.getUserOrders(userId);
        return response;
    }
);

// Fetch order details
export const fetchOrderDetails = createAsyncThunk(
    'order/fetchDetails',
    async (orderId: string) => {
        const response = await orderService.getOrderDetails(orderId);
        return response;
    }
);

// Cancel order
export const cancelOrder = createAsyncThunk(
    'order/cancel',
    async (orderId: string) => {
        await orderService.cancelOrder(orderId);
        return orderId;
    }
);

// Rate order
export const rateOrder = createAsyncThunk(
    'order/rate',
    async ({ orderId, rating }: { orderId: string; rating: OrderRating }) => {
        const response = await orderService.rateOrder(orderId, rating);
        return { orderId, rating: response };
    }
);

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
            state.currentOrder = action.payload;
        },
        updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: any }>) => {
            const { orderId, status } = action.payload;
            const order = state.orders.find(o => o.id === orderId);
            if (order) {
                order.status = status;
            }
            if (state.currentOrder?.id === orderId) {
                state.currentOrder.status = status;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.orders.unshift(action.payload);
                state.currentOrder = action.payload;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create order';
            })
            // Fetch Orders
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.orders = action.payload;
            })
            // Fetch Order Details
            .addCase(fetchOrderDetails.fulfilled, (state, action) => {
                state.currentOrder = action.payload;
            })
            // Cancel Order
            .addCase(cancelOrder.fulfilled, (state, action) => {
                const index = state.orders.findIndex(o => o.id === action.payload);
                if (index !== -1) {
                    state.orders[index].status = 'cancelled';
                }
            })
            // Rate Order
            .addCase(rateOrder.fulfilled, (state, action) => {
                const { orderId, rating } = action.payload;
                const order = state.orders.find(o => o.id === orderId);
                if (order) {
                    order.rating = rating;
                }
            });
    }
});

export const { clearError, setCurrentOrder, updateOrderStatus } = orderSlice.actions;
export default orderSlice.reducer;
