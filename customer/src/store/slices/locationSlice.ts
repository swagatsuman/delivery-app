import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { LocationState, Address } from '../../types';
import { locationService } from '../../services/locationService';

const initialState: LocationState = {
    currentLocation: null,
    addresses: [],
    loading: false,
    error: null
};

// Set user location
export const setUserLocation = createAsyncThunk(
    'location/setUserLocation',
    async (address: Address) => {
        await locationService.setCurrentLocation(address);
        return address;
    }
);

// Fetch user addresses
export const fetchAddresses = createAsyncThunk(
    'location/fetchAddresses',
    async (userId: string) => {
        const response = await locationService.getUserAddresses(userId);
        return response;
    }
);

// Add new address
export const addAddress = createAsyncThunk(
    'location/addAddress',
    async (address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) => {
        const response = await locationService.addAddress(address);
        return response;
    }
);

// Update address
export const updateAddress = createAsyncThunk(
    'location/updateAddress',
    async ({ id, data }: { id: string; data: Partial<Address> }) => {
        const response = await locationService.updateAddress(id, data);
        return response;
    }
);

// Delete address
export const deleteAddress = createAsyncThunk(
    'location/deleteAddress',
    async (id: string) => {
        await locationService.deleteAddress(id);
        return id;
    }
);

// Set default address
export const setDefaultAddress = createAsyncThunk(
    'location/setDefaultAddress',
    async (addressId: string) => {
        await locationService.setDefaultAddress(addressId);
        return addressId;
    }
);

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentLocation: (state, action: PayloadAction<Address>) => {
            state.currentLocation = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Set User Location
            .addCase(setUserLocation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(setUserLocation.fulfilled, (state, action) => {
                state.loading = false;
                state.currentLocation = action.payload;

                // Add to addresses if not exists
                const existingIndex = state.addresses.findIndex(addr => addr.id === action.payload.id);
                if (existingIndex === -1) {
                    state.addresses.push(action.payload);
                }
            })
            .addCase(setUserLocation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to set location';
            })
            // Fetch Addresses
            .addCase(fetchAddresses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAddresses.fulfilled, (state, action) => {
                state.loading = false;
                state.addresses = action.payload;

                // Set current location to default address if not set
                if (!state.currentLocation) {
                    const defaultAddress = action.payload.find(addr => addr.isDefault);
                    if (defaultAddress) {
                        state.currentLocation = defaultAddress;
                    }
                }
            })
            .addCase(fetchAddresses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch addresses';
            })
            // Add Address
            .addCase(addAddress.fulfilled, (state, action) => {
                state.addresses.push(action.payload);

                // Set as current location if it's the first address
                if (state.addresses.length === 1) {
                    state.currentLocation = action.payload;
                }
            })
            // Update Address
            .addCase(updateAddress.fulfilled, (state, action) => {
                const index = state.addresses.findIndex(addr => addr.id === action.payload.id);
                if (index !== -1) {
                    state.addresses[index] = action.payload;

                    // Update current location if it's the same address
                    if (state.currentLocation?.id === action.payload.id) {
                        state.currentLocation = action.payload;
                    }
                }
            })
            // Delete Address
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.addresses = state.addresses.filter(addr => addr.id !== action.payload);

                // Clear current location if it was the deleted address
                if (state.currentLocation?.id === action.payload) {
                    state.currentLocation = state.addresses.find(addr => addr.isDefault) || null;
                }
            })
            // Set Default Address
            .addCase(setDefaultAddress.fulfilled, (state, action) => {
                // Update all addresses to set only one as default
                state.addresses = state.addresses.map(addr => ({
                    ...addr,
                    isDefault: addr.id === action.payload
                }));

                // Set as current location
                const defaultAddress = state.addresses.find(addr => addr.id === action.payload);
                if (defaultAddress) {
                    state.currentLocation = defaultAddress;
                }
            });
    }
});

export const { clearError, setCurrentLocation } = locationSlice.actions;
export default locationSlice.reducer;
