import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import locationReducer from './slices/locationSlice';
import cartReducer from './slices/cartSlice';
import restaurantReducer from './slices/restaurantSlice';
import orderReducer from './slices/orderSlice';
import searchReducer from './slices/searchSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        location: locationReducer,
        cart: cartReducer,
        restaurant: restaurantReducer,
        order: orderReducer,
        search: searchReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
            }
        })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
