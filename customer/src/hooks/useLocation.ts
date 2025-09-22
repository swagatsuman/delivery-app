import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import { setCurrentLocation } from '../store/slices/locationSlice';
import type { Coordinates } from '../types';

export const useLocation = () => {
    const dispatch = useAppDispatch();
    const { currentLocation, addresses } = useAppSelector(state => state.location);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getCurrentPosition = (): Promise<Coordinates> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(new Error('Unable to get current location'));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    };

    const requestLocation = async () => {
        try {
            setLoading(true);
            setError(null);

            const coordinates = await getCurrentPosition();

            // You would typically reverse geocode these coordinates
            // to get a proper address. For now, creating a basic address
            const address = {
                id: 'current-location',
                userId: 'current-user',
                label: 'Current Location',
                address: 'Current Location',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560001',
                coordinates,
                isDefault: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            dispatch(setCurrentLocation(address));
            return coordinates;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        currentLocation,
        addresses,
        loading,
        error,
        getCurrentPosition,
        requestLocation
    };
};
