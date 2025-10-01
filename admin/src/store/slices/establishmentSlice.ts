import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { EstablishmentState, EstablishmentFilters } from '../../types';
import { establishmentService } from '../../services/establishmentService';

const initialState: EstablishmentState = {
    establishments: [],
    selectedEstablishment: null,
    loading: false,
    error: null,
    filters: {
        status: 'all',
        establishmentType: 'all',
        search: '',
        cuisine: '',
        rating: null
    },
    pagination: {
        page: 1,
        limit: 20,
        total: 0
    }
};

export const fetchEstablishments = createAsyncThunk(
    'establishments/fetchEstablishments',
    async (params?: { filters?: EstablishmentFilters; page?: number; limit?: number }) => {
        const response = await establishmentService.getEstablishments(params);
        return response;
    }
);

export const fetchEstablishmentDetails = createAsyncThunk(
    'establishments/fetchDetails',
    async (id: string) => {
        const response = await establishmentService.getEstablishmentDetails(id);
        return response;
    }
);

export const updateEstablishmentStatus = createAsyncThunk(
    'establishments/updateStatus',
    async ({ uid, status, rejectedReason }: { uid: string; status: string; rejectedReason?: string }) => {
        await establishmentService.updateEstablishmentStatus(uid, status, rejectedReason);
        return { uid, status };
    }
);

export const approveEstablishment = createAsyncThunk(
    'establishments/approve',
    async ({ uid, approvedBy }: { uid: string; approvedBy: string }) => {
        await establishmentService.approveEstablishment(uid, approvedBy);
        return { uid, status: 'approved' };
    }
);

export const rejectEstablishment = createAsyncThunk(
    'establishments/reject',
    async ({ uid, rejectedReason }: { uid: string; rejectedReason: string }) => {
        await establishmentService.rejectEstablishment(uid, rejectedReason);
        return { uid, status: 'rejected' };
    }
);

const establishmentSlice = createSlice({
    name: 'establishments',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<Partial<EstablishmentFilters>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setPagination: (state, action: PayloadAction<{ page?: number; limit?: number }>) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedEstablishment: (state) => {
            state.selectedEstablishment = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Establishments
            .addCase(fetchEstablishments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEstablishments.fulfilled, (state, action) => {
                state.loading = false;
                state.establishments = action.payload.establishments;
                state.pagination.total = action.payload.total;
            })
            .addCase(fetchEstablishments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch establishments';
            })
            // Fetch Establishment Details
            .addCase(fetchEstablishmentDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEstablishmentDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedEstablishment = action.payload;
            })
            .addCase(fetchEstablishmentDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch establishment details';
            })
            // Update Establishment Status
            .addCase(updateEstablishmentStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEstablishmentStatus.fulfilled, (state, action) => {
                state.loading = false;
                const { uid, status } = action.payload;

                // Update in establishments list
                const establishment = state.establishments.find(r => r.uid === uid);
                if (establishment) {
                    establishment.status = status as any;
                }

                // Update selected establishment if it's the same one
                if (state.selectedEstablishment && state.selectedEstablishment.uid === uid) {
                    state.selectedEstablishment.status = status as any;
                }
            })
            .addCase(updateEstablishmentStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update establishment status';
            })
            // Approve Establishment
            .addCase(approveEstablishment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveEstablishment.fulfilled, (state, action) => {
                state.loading = false;
                const { uid, status } = action.payload;

                // Update in establishments list
                const establishment = state.establishments.find(r => r.uid === uid);
                if (establishment) {
                    establishment.status = 'active';
                }

                // Update selected establishment if it's the same one
                if (state.selectedEstablishment && state.selectedEstablishment.uid === uid) {
                    state.selectedEstablishment.status = 'active';
                }
            })
            .addCase(approveEstablishment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to approve establishment';
            })
            // Reject Establishment
            .addCase(rejectEstablishment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectEstablishment.fulfilled, (state, action) => {
                state.loading = false;
                const { uid, status } = action.payload;

                // Update in establishments list
                const establishment = state.establishments.find(r => r.uid === uid);
                if (establishment) {
                    establishment.status = 'suspended';
                }

                // Update selected establishment if it's the same one
                if (state.selectedEstablishment && state.selectedEstablishment.uid === uid) {
                    state.selectedEstablishment.status = 'suspended';
                }
            })
            .addCase(rejectEstablishment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to reject establishment';
            });
    }
});

export const { setFilters, setPagination, clearError, clearSelectedEstablishment } = establishmentSlice.actions;
export default establishmentSlice.reducer;