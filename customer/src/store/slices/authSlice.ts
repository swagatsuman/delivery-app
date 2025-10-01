import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../../types';
import { authService } from '../../services/authService';

// Load initial state from localStorage if available
const loadPersistedState = (): Partial<AuthState> => {
    try {
        const persistedUser = localStorage.getItem('foodEatsCustomerUser');
        if (persistedUser) {
            const user = JSON.parse(persistedUser);
            // Validate the user object has required fields
            if (user.uid && user.email && user.name && user.role === 'customer') {
                return {
                    user,
                    isAuthenticated: true
                };
            }
        }
    } catch (error) {
        console.warn('Error loading persisted auth state:', error);
        localStorage.removeItem('foodEatsCustomerUser');
    }
    return {};
};

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false, // Start with loading true to check auth state
    error: null,
    passwordResetSent: false,
    ...loadPersistedState()
};

// Sign Up
export const signUpUser = createAsyncThunk(
    'auth/signUp',
    async (signupData: {
        email: string;
        password: string;
        name: string;
        phone: string;
    }) => {
        const response = await authService.signUp(signupData);
        return response.userData; // Return just userData to match the pattern
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
        return response.userData; // Return just userData to match the pattern
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
        return response?.userData || null;
    }
);

// Logout
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async () => {
        await authService.signOut();
    }
);

// Update Profile
export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (profileData: {
        name?: string;
        phone?: string;
        email?: string;
        defaultAddressId?: string;
    }) => {
        const response = await authService.updateProfile(profileData);
        return response;
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
            state.loading = false;

            // Persist user data to localStorage
            if (action.payload) {
                try {
                    localStorage.setItem('foodEatsCustomerUser', JSON.stringify(action.payload));
                } catch (error) {
                    console.warn('Error persisting user data:', error);
                }
            } else {
                localStorage.removeItem('foodEatsCustomerUser');
            }
        },
        resetPasswordResetSent: (state) => {
            state.passwordResetSent = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        initializeAuthState: (state) => {
            // This action is called when the app starts to set loading state
            state.loading = !state.user; // If we have a persisted user, don't show loading
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

                // Persist to localStorage
                try {
                    localStorage.setItem('foodEatsCustomerUser', JSON.stringify(action.payload));
                } catch (error) {
                    console.warn('Error persisting user data:', error);
                }
            })
            .addCase(signUpUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create account';
                state.isAuthenticated = false;
                localStorage.removeItem('foodEatsCustomerUser');
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

                // Persist to localStorage
                try {
                    localStorage.setItem('foodEatsCustomerUser', JSON.stringify(action.payload));
                } catch (error) {
                    console.warn('Error persisting user data:', error);
                }
            })
            .addCase(signInUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to sign in';
                state.isAuthenticated = false;
                localStorage.removeItem('foodEatsCustomerUser');
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
                // Don't show loading if we already have a user from localStorage
                if (!state.user) {
                state.loading = true;
                }
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                state.user = action.payload;
                    state.isAuthenticated = true;

                    // Update localStorage with fresh data
                    try {
                        localStorage.setItem('foodEatsCustomerUser', JSON.stringify(action.payload));
                    } catch (error) {
                        console.warn('Error persisting user data:', error);
                    }
                } else {
                    state.user = null;
                    state.isAuthenticated = false;
                    localStorage.removeItem('foodEatsCustomerUser');
                }
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                localStorage.removeItem('foodEatsCustomerUser');
            })
            // Update Profile
            .addCase(updateProfile.fulfilled, (state, action) => {
                if (state.user) {
                    state.user = { ...state.user, ...action.payload };

                    // Update localStorage
                    try {
                        localStorage.setItem('foodEatsCustomerUser', JSON.stringify(state.user));
                    } catch (error) {
                        console.warn('Error persisting user data:', error);
                    }
                }
            })
            // Logout
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
                state.passwordResetSent = false;
                localStorage.removeItem('foodEatsCustomerUser');
            })
            .addCase(logoutUser.rejected, (state) => {
                state.loading = false;
                // Even if logout fails, clear local state
                state.user = null;
                state.isAuthenticated = false;
                localStorage.removeItem('foodEatsCustomerUser');
            });
    }
});

export const {
    clearError,
    setUser,
    resetPasswordResetSent,
    setLoading,
    initializeAuthState
} = authSlice.actions;

export default authSlice.reducer;
