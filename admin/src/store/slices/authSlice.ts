import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../../types';
import { authService } from '../../services/authService';

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
};

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }: { email: string; password: string }) => {
        const response = await authService.signIn(email, password);
        return response.userData;
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async () => {
        await authService.signOut();
    }
);

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async () => {
        const response = await authService.getCurrentUser();
        return response?.userData || null;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Login failed';
                state.isAuthenticated = false;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            // Get Current User
            .addCase(getCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = !!action.payload;
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
            });
    }
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
