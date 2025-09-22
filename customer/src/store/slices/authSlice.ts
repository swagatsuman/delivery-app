import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../../types';
import { authService } from '../../services/authService';

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    passwordResetSent: false
};

// Sign Up
export const signUpUser = createAsyncThunk(
    'auth/signUp',
    async ({ email, password, name, phone }: {
        email: string;
        password: string;
        name: string;
        phone: string;
    }) => {
        const response = await authService.signUp(email, password, name, phone);
        return response;
    }
);

// Sign In
export const signInUser = createAsyncThunk(
    'auth/signIn',
    async ({ email, password }: {
        email: string;
        password: string;
    }) => {
        const response = await authService.signIn(email, password);
        return response;
    }
);

// Reset Password
export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async (email: string) => {
        await authService.resetPassword(email);
        return email;
    }
);

// Get Current User
export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async () => {
        const response = await authService.getCurrentUser();
        return response;
    }
);

// Logout
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async () => {
        await authService.logout();
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
        },
        resetPasswordResetSent: (state) => {
            state.passwordResetSent = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Sign Up
            .addCase(signUpUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signUpUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(signUpUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create account';
            })
            // Sign In
            .addCase(signInUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signInUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(signInUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to sign in';
            })
            // Reset Password
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.passwordResetSent = false;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.loading = false;
                state.passwordResetSent = true;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to send reset email';
                state.passwordResetSent = false;
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
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
                state.passwordResetSent = false;
            });
    }
});

export const { clearError, setUser, resetPasswordResetSent } = authSlice.actions;
export default authSlice.reducer;
