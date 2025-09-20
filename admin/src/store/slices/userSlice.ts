import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { UserState, UserFilters } from '../../types';
import { userService } from '../../services/userService';

const initialState: UserState = {
    users: [],
    selectedUser: null,
    loading: false,
    error: null,
    filters: {
        role: 'all',
        status: 'all',
        search: ''
    },
    pagination: {
        page: 1,
        limit: 20,
        total: 0
    }
};

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (params?: { filters?: UserFilters; page?: number; limit?: number }) => {
        const response = await userService.getUsers(params);
        return response;
    }
);

export const updateUserStatus = createAsyncThunk(
    'users/updateStatus',
    async ({ uid, status }: { uid: string; status: string }) => {
        await userService.updateUserStatus(uid, status);
        return { uid, status };
    }
);

export const fetchUserDetails = createAsyncThunk(
    'users/fetchDetails',
    async (id: string) => {
        const response = await userService.getUserDetails(id);
        return response;
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<Partial<UserFilters>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setPagination: (state, action: PayloadAction<{ page?: number; limit?: number }>) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.users;
                state.pagination.total = action.payload.total;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch users';
            })
            // Update User Status
            .addCase(updateUserStatus.fulfilled, (state, action) => {
                const { uid, status } = action.payload;
                const user = state.users.find(u => u.uid === uid);
                if (user) {
                    user.status = status as any;
                }
            })
            // Fetch User Details
            .addCase(fetchUserDetails.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedUser = action.payload;
            })
            .addCase(fetchUserDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch user details';
            });
    }
});

export const { setFilters, setPagination, clearError, clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;
