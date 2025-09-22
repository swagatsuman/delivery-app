import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { LocationState, Address } from '../../types';
import { locationService } from '../../services/locationService';

// Load persisted location state
const loadPersistedLocationState = (): Partial<LocationState> => {
    try {
        const currentLocation = localStorage.getItem('foodEatsCurrentLocation');
        const addresses = localStorage.getItem('foodEatsAddresses');

        const persistedState: Partial<LocationState> = {};

        if (currentLocation) {
            const location = JSON.parse(currentLocation);
            if (location && location.id && location.coordinates) {
                persistedState.currentLocation = {
                    ...location,
                    createdAt: new Date(location.createdAt),
                    updatedAt: new Date(location.updatedAt)
                };
            }
        }

        if (addresses) {
            const addressList = JSON.parse(addresses);
            if (Array.isArray(addressList)) {
                persistedState.addresses = addressList.map(addr => ({
                    ...addr,
                    createdAt: new Date(addr.createdAt),
                    updatedAt: new Date(addr.updatedAt)
                }));
            }
        }

        return persistedState;
    } catch (error) {
        console.warn('Error loading persisted location state:', error);
        localStorage.removeItem('foodEatsCurrentLocation');
        localStorage.removeItem('foodEatsAddresses');
        return {};
    }
};

const initialState: LocationState = {
    currentLocation: null,
    addresses: [],
    loading: false,
    error: null,
    ...loadPersistedLocationState()
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

// Initialize location from storage
export const initializeLocation = createAsyncThunk(
    'location/initialize',
    async (userId: string) => {
        try {
            // First try to get from localStorage
            const persistedState = loadPersistedLocationState();
            if (persistedState.currentLocation) {
                return persistedState;
            }

            // If no persisted location, fetch from server
            const addresses = await locationService.getUserAddresses(userId);
            const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];

            if (defaultAddress) {
                await locationService.setCurrentLocation(defaultAddress);
                return {
                    currentLocation: defaultAddress,
                    addresses
                };
            }

            return { addresses, currentLocation: null };
        } catch (error) {
            console.error('Error initializing location:', error);
            return { addresses: [], currentLocation: null };
        }
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

            // Persist to localStorage
            try {
                localStorage.setItem('foodEatsCurrentLocation', JSON.stringify(action.payload));
            } catch (error) {
                console.warn('Error persisting current location:', error);
            }
        },
        clearCurrentLocation: (state) => {
            state.currentLocation = null;
            localStorage.removeItem('foodEatsCurrentLocation');
        },
        // Action to restore state from localStorage on app start
        restorePersistedLocation: (state) => {
            const persistedState = loadPersistedLocationState();
            if (persistedState.currentLocation) {
                state.currentLocation = persistedState.currentLocation;
            }
            if (persistedState.addresses) {
                state.addresses = persistedState.addresses;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Initialize Location
            .addCase(initializeLocation.fulfilled, (state, action) => {
                const { currentLocation, addresses } = action.payload;
                if (currentLocation) {
                    state.currentLocation = currentLocation;
                    try {
                        localStorage.setItem('foodEatsCurrentLocation', JSON.stringify(currentLocation));
                    } catch (error) {
                        console.warn('Error persisting location:', error);
                    }
                }
                if (addresses) {
                    state.addresses = addresses;
                    try {
                        localStorage.setItem('foodEatsAddresses', JSON.stringify(addresses));
                    } catch (error) {
                        console.warn('Error persisting addresses:', error);
                    }
                }
            })
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

                // Persist both
                try {
                    localStorage.setItem('foodEatsCurrentLocation', JSON.stringify(action.payload));
                    localStorage.setItem('foodEatsAddresses', JSON.stringify(state.addresses));
                } catch (error) {
                    console.warn('Error persisting location data:', error);
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
                        try {
                            localStorage.setItem('foodEatsCurrentLocation', JSON.stringify(defaultAddress));
                        } catch (error) {
                            console.warn('Error persisting location:', error);
                        }
                    }
                }

                // Persist addresses
                try {
                    localStorage.setItem('foodEatsAddresses', JSON.stringify(action.payload));
                } catch (error) {
                    console.warn('Error persisting addresses:', error);
                }
            })
            .addCase(fetchAddresses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch addresses';
            })
            // Add Address
            .addCase(addAddress.fulfilled, (state, action) => {
                state.addresses.push(action.payload);

                // Set as current location if it's the first address or is default
                if (state.addresses.length === 1 || action.payload.isDefault) {
                    state.currentLocation = action.payload;
                    try {
                        localStorage.setItem('foodEatsCurrentLocation', JSON.stringify(action.payload));
                    } catch (error) {
                        console.warn('Error persisting location:', error);
                    }
                }

                // Persist addresses
                try {
                    localStorage.setItem('foodEatsAddresses', JSON.stringify(state.addresses));
                } catch (error) {
                    console.warn('Error persisting addresses:', error);
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
                        try {
                            localStorage.setItem('foodEatsCurrentLocation', JSON.stringify(action.payload));
                        } catch (error) {
                            console.warn('Error persisting location:', error);
                        }
                    }

                    // Persist addresses
                    try {
                        localStorage.setItem('foodEatsAddresses', JSON.stringify(state.addresses));
                    } catch (error) {
                        console.warn('Error persisting addresses:', error);
                    }
                }
            })
            // Delete Address
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.addresses = state.addresses.filter(addr => addr.id !== action.payload);

                // Clear current location if it was the deleted address
                if (state.currentLocation?.id === action.payload) {
                    const defaultAddress = state.addresses.find(addr => addr.isDefault);
                    state.currentLocation = defaultAddress || null;

                    if (state.currentLocation) {
                        try {
                            localStorage.setItem('foodEatsCurrentLocation', JSON.stringify(state.currentLocation));
                        } catch (error) {
                            console.warn('Error persisting location:', error);
                        }
                    } else {
                        localStorage.removeItem('foodEatsCurrentLocation');
                    }
                }

                // Persist addresses
                try {
                    localStorage.setItem('foodEatsAddresses', JSON.stringify(state.addresses));
                } catch (error) {
                    console.warn('Error persisting addresses:', error);
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
                    try {
                        localStorage.setItem('foodEatsCurrentLocation', JSON.stringify(defaultAddress));
                    } catch (error) {
                        console.warn('Error persisting location:', error);
                    }
                }

                // Persist addresses
                try {
                    localStorage.setItem('foodEatsAddresses', JSON.stringify(state.addresses));
                } catch (error) {
                    console.warn('Error persisting addresses:', error);
                }
            });
    }
});

export const {
    clearError,
    setCurrentLocation,
    clearCurrentLocation,
    restorePersistedLocation
} = locationSlice.actions;

export default locationSlice.reducer;
