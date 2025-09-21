import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../../types';
import { authService } from '../../services/authService';

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    otpSent: false
};

// Send OTP
export const sendOTP = createAsyncThunk(
    'auth/sendOTP',
    async ({ phone, type, userData }: {
        phone: string;
        type: 'login' | 'signup';
        userData?: { name: string }
    }) => {
        const response = await authService.sendOTP(phone, type, userData);
        return response;
    }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
    'auth/verifyOTP',
    async ({ phone, otp, type, userData }: {
        phone: string;
        otp: string;
        type: 'login' | 'signup';
        userData?: { name: string }
    }) => {
        const response = await authService.verifyOTP(phone, otp, type, userData);
        return response;
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
        resetOtpSent: (state) => {
            state.otpSent = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Send OTP
            .addCase(sendOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.otpSent = false;
            })
            .addCase(sendOTP.fulfilled, (state) => {
                state.loading = false;
                state.otpSent = true;
            })
            .addCase(sendOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to send OTP';
                state.otpSent = false;
            })
            // Verify OTP
            .addCase(verifyOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyOTP.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.otpSent = false;
            })
            .addCase(verifyOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Invalid OTP';
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
                state.otpSent = false;
            });
    }
});

export const { clearError, setUser, resetOtpSent } = authSlice.actions;
export default authSlice.reducer;
