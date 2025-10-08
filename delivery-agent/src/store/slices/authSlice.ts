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

export const signupUser = createAsyncThunk(
    'auth/signupUser',
    async (userData: any) => {
        const response = await authService.signUp(userData);
        return response.userData;
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async () => {
        await authService.signOut();
    }
);

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (profileData: any) => {
        // Implementation would update profile in Firebase
        return profileData;
    }
);

export const updateAgentAvailability = createAsyncThunk(
    'auth/updateAgentAvailability',
    async (isAvailable: boolean) => {
        await authService.updateAvailability(isAvailable);
        return isAvailable;
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
        updateAvailabilityStatus: (state, action: PayloadAction<boolean>) => {
            if (state.user?.deliveryAgentDetails) {
                state.user.deliveryAgentDetails.isAvailable = action.payload;
                state.user.deliveryAgentDetails.workingHours = {
                    ...state.user.deliveryAgentDetails.workingHours,
                    isOnline: action.payload
                };
            }
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
            // Signup
            .addCase(signupUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Signup failed';
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            // Update Agent Availability
            .addCase(updateAgentAvailability.fulfilled, (state, action) => {
                if (state.user?.deliveryAgentDetails) {
                    state.user.deliveryAgentDetails.isAvailable = action.payload;
                    state.user.deliveryAgentDetails.workingHours = {
                        ...state.user.deliveryAgentDetails.workingHours,
                        isOnline: action.payload
                    };
                }
            });
    }
});

export const { clearError, setUser, updateAvailabilityStatus } = authSlice.actions;
export default authSlice.reducer;
