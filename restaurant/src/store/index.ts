import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import menuSlice from './slices/menuSlice';
import orderSlice from './slices/orderSlice';
import dashboardSlice from './slices/dashboardSlice';

export const store = configureStore({
    reducer: {
        auth: authSlice,
        menu: menuSlice,
        orders: orderSlice,
        dashboard: dashboardSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                ignoredPaths: ['auth.user.createdAt', 'auth.user.updatedAt']
            }
        }),
    devTools: import.meta.env.MODE !== 'production'
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
