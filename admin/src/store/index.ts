import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import restaurantSlice from './slices/restaurantSlice';
import userSlice from './slices/userSlice';
import dashboardSlice from './slices/dashboardSlice';
import deliveryAgentSlice from "./slices/deliveryAgentSlice.ts";

export const store = configureStore({
    reducer: {
        auth: authSlice,
        restaurants: restaurantSlice,
        users: userSlice,
        dashboard: dashboardSlice,
        deliveryAgents: deliveryAgentSlice
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
