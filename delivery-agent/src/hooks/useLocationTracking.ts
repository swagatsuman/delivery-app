import { useEffect, useRef, useState } from 'react';
import { authService } from '../services/authService';

interface LocationState {
    isTracking: boolean;
    hasPermission: boolean | null;
    error: string | null;
    currentLocation: { lat: number; lng: number } | null;
}

interface UseLocationTrackingOptions {
    /**
     * Whether location tracking should be active
     */
    shouldTrack: boolean;
    /**
     * Update interval in milliseconds (default: 15000ms = 15 seconds)
     */
    updateInterval?: number;
    /**
     * Callback when location is updated
     */
    onLocationUpdate?: (location: { lat: number; lng: number }) => void;
    /**
     * Callback when error occurs
     */
    onError?: (error: string) => void;
}

/**
 * Custom hook for tracking delivery agent's GPS location
 *
 * Features:
 * - Uses browser's Geolocation API
 * - Updates Firestore at configurable intervals (default: 15 seconds)
 * - Only tracks when shouldTrack is true (e.g., when agent has active deliveries)
 * - Handles permissions and errors gracefully
 *
 * @example
 * const { isTracking, hasPermission, error, requestPermission } = useLocationTracking({
 *   shouldTrack: hasActiveDeliveries,
 *   updateInterval: 15000
 * });
 */
export const useLocationTracking = ({
    shouldTrack,
    updateInterval = 15000, // 15 seconds default
    onLocationUpdate,
    onError
}: UseLocationTrackingOptions) => {
    const [state, setState] = useState<LocationState>({
        isTracking: false,
        hasPermission: null,
        error: null,
        currentLocation: null
    });

    const watchIdRef = useRef<number | null>(null);
    const lastUpdateRef = useRef<number>(0);
    const updateIntervalRef = useRef(updateInterval);

    // Update interval ref when it changes
    useEffect(() => {
        updateIntervalRef.current = updateInterval;
    }, [updateInterval]);

    /**
     * Request location permission from user
     */
    const requestPermission = async () => {
        if (!navigator.geolocation) {
            const errorMsg = 'Geolocation is not supported by your browser';
            setState(prev => ({ ...prev, error: errorMsg, hasPermission: false }));
            onError?.(errorMsg);
            return false;
        }

        try {
            // Try to get current position to trigger permission request
            await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            setState(prev => ({ ...prev, hasPermission: true, error: null }));
            return true;
        } catch (error: any) {
            let errorMsg = 'Failed to get location permission';

            if (error.code === error.PERMISSION_DENIED) {
                errorMsg = 'Location permission denied. Please enable location access in your browser settings.';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                errorMsg = 'Location information unavailable. Please check your device settings.';
            } else if (error.code === error.TIMEOUT) {
                errorMsg = 'Location request timed out. Please try again.';
            }

            setState(prev => ({ ...prev, error: errorMsg, hasPermission: false }));
            onError?.(errorMsg);
            return false;
        }
    };

    /**
     * Update location to Firestore
     */
    const updateLocation = async (position: GeolocationPosition) => {
        const now = Date.now();

        // Throttle updates based on updateInterval
        if (now - lastUpdateRef.current < updateIntervalRef.current) {
            return;
        }

        const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        try {
            // Update Firestore
            await authService.updateLocation(location);

            // Update local state
            setState(prev => ({
                ...prev,
                currentLocation: location,
                error: null
            }));

            // Call callback
            onLocationUpdate?.(location);

            // Update last update timestamp
            lastUpdateRef.current = now;

            console.debug('Location updated:', location);
        } catch (error: any) {
            console.error('Failed to update location:', error);
            const errorMsg = error.message || 'Failed to update location';
            setState(prev => ({ ...prev, error: errorMsg }));
            onError?.(errorMsg);
        }
    };

    /**
     * Start tracking location
     */
    const startTracking = () => {
        if (!navigator.geolocation) {
            const errorMsg = 'Geolocation is not supported by your browser';
            setState(prev => ({ ...prev, error: errorMsg }));
            onError?.(errorMsg);
            return;
        }

        // Stop existing watch if any
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        console.log('Starting location tracking with', updateIntervalRef.current / 1000, 'second intervals');

        // Start watching position
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                updateLocation(position);
            },
            (error) => {
                let errorMsg = 'Failed to get location';

                if (error.code === error.PERMISSION_DENIED) {
                    errorMsg = 'Location permission denied';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMsg = 'Location unavailable';
                } else if (error.code === error.TIMEOUT) {
                    errorMsg = 'Location request timed out';
                }

                console.error('Geolocation error:', errorMsg);
                setState(prev => ({ ...prev, error: errorMsg, isTracking: false }));
                onError?.(errorMsg);
            },
            {
                enableHighAccuracy: true, // Use GPS for better accuracy
                timeout: 10000, // 10 seconds
                maximumAge: 0 // Don't use cached position
            }
        );

        setState(prev => ({ ...prev, isTracking: true, error: null }));
    };

    /**
     * Stop tracking location
     */
    const stopTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        console.log('Stopped location tracking');
        setState(prev => ({ ...prev, isTracking: false }));
    };

    /**
     * Manually refresh current location
     */
    const refreshLocation = async () => {
        if (!navigator.geolocation) {
            const errorMsg = 'Geolocation is not supported by your browser';
            setState(prev => ({ ...prev, error: errorMsg }));
            onError?.(errorMsg);
            return;
        }

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            // Force update regardless of interval
            lastUpdateRef.current = 0;
            await updateLocation(position);
        } catch (error: any) {
            const errorMsg = error.message || 'Failed to refresh location';
            setState(prev => ({ ...prev, error: errorMsg }));
            onError?.(errorMsg);
        }
    };

    // Auto start/stop tracking based on shouldTrack
    useEffect(() => {
        if (shouldTrack && state.hasPermission) {
            startTracking();
        } else {
            stopTracking();
        }

        // Cleanup on unmount
        return () => {
            stopTracking();
        };
    }, [shouldTrack, state.hasPermission]);

    return {
        ...state,
        requestPermission,
        refreshLocation,
        startTracking,
        stopTracking
    };
};
