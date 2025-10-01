import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { GooglePlacesInput } from '../../components/common/GooglePlacesInput';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setUserLocation } from '../../store/slices/locationSlice';
import type { Coordinates } from '../../types';

declare global {
    interface Window {
        google: any;
        initGooglePlaces: () => void;
    }
}

const LocationSetup: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const [selectedLocation, setSelectedLocation] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [googleLoaded, setGoogleLoaded] = useState(false);

    useEffect(() => {
        // Load Google Maps API if not already loaded
        if (window.google && window.google.maps) {
            setGoogleLoaded(true);
            return;
        }

        const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            console.warn('Google Places API key not found');
            return;
        }

        if (document.getElementById('google-maps-script')) {
            return;
        }

        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
        script.async = true;
        script.defer = true;

        window.initGooglePlaces = () => {
            setGoogleLoaded(true);
        };

        script.onerror = () => {
            console.error('Failed to load Google Places API');
        };

        document.head.appendChild(script);
    }, []);

    const handleLocationSelect = (place: any) => {
        setSelectedLocation(place);
    };

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }

        if (!googleLoaded || !window.google || !window.google.maps) {
            alert('Google Maps is loading. Please wait a moment and try again.');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coordinates: Coordinates = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Use Google's Geocoder to get the actual address
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode(
                    { location: coordinates },
                    (results: any[], status: any) => {
                        console.log('Geocoding status:', status);
                        console.log('Geocoding results:', results);

                        if (status === 'OK' && results && results.length > 0) {
                            const result = results[0];
                            const addressComponents = result.address_components || [];

                            let city = '';
                            let state = '';
                            let pincode = '';

                            addressComponents.forEach((component: any) => {
                                const types = component.types;

                                if (types.includes('locality')) {
                                    city = component.long_name;
                                } else if (types.includes('administrative_area_level_2') && !city) {
                                    city = component.long_name;
                                } else if (types.includes('administrative_area_level_1')) {
                                    state = component.long_name;
                                } else if (types.includes('postal_code')) {
                                    pincode = component.long_name;
                                }
                            });

                            setSelectedLocation({
                                address: result.formatted_address,
                                coordinates,
                                city: city.trim() || 'Unknown',
                                state: state.trim() || 'Unknown',
                                pincode: pincode.trim() || '000000'
                            });
                        } else {
                            console.error('Reverse geocoding failed. Status:', status);
                            console.error('Error details:', results);

                            // Fallback: Use coordinates as address if geocoding fails
                            if (status === 'REQUEST_DENIED') {
                                console.warn('Geocoding API not enabled. Using coordinates as fallback.');
                                setSelectedLocation({
                                    address: `Location: ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
                                    coordinates,
                                    city: 'Bangalore',
                                    state: 'Karnataka',
                                    pincode: '560001'
                                });
                            } else {
                                // Provide more specific error message for other errors
                                let errorMessage = 'Unable to get address for your location.';
                                if (status === 'ZERO_RESULTS') {
                                    errorMessage += ' No address found for this location.';
                                } else if (status === 'OVER_QUERY_LIMIT') {
                                    errorMessage += ' API quota exceeded.';
                                } else if (status === 'INVALID_REQUEST') {
                                    errorMessage += ' Invalid request.';
                                }
                                alert(errorMessage + ' Please try searching manually.');
                            }
                        }
                        setLoading(false);
                    }
                );
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Unable to get your current location. Please try again.');
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    };

    const handleContinue = async () => {
        if (!selectedLocation) return;

        try {
            setLoading(true);

            const address = {
                id: 'location-setup',
                userId: 'current-user',
                label: 'Home',
                address: selectedLocation.address,
                city: selectedLocation.city,
                state: selectedLocation.state,
                pincode: selectedLocation.pincode,
                coordinates: selectedLocation.coordinates,
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await dispatch(setUserLocation(address));
            navigate('/home');
        } catch (error) {
            console.error('Error setting location:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="pt-12 pb-8 px-6 text-center">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPin className="h-10 w-10 text-primary-600" />
                </div>
                <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                    Add your location
                </h1>
                <p className="text-secondary-600">
                    We'll find the best restaurants and deliver to you
                </p>
            </div>

            {/* Content */}
            <div className="flex-1 px-6">
                <div className="max-w-md mx-auto space-y-6">
                    {/* Current Location Button */}
                    <Button
                        onClick={handleCurrentLocation}
                        variant="secondary"
                        className="w-full h-12"
                        loading={loading}
                    >
                        <MapPin className="h-5 w-5 mr-2" />
                        Use Current Location
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-secondary-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-background text-secondary-500">OR</span>
                        </div>
                    </div>

                    {/* Address Search */}
                    <GooglePlacesInput
                        onPlaceSelect={handleLocationSelect}
                        placeholder="Search for area, street name..."
                    />

                    {/* Selected Location */}
                    {selectedLocation && (
                        <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <MapPin className="h-5 w-5 text-primary-600 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium text-primary-900">Selected Location</p>
                                    <p className="text-sm text-primary-700">{selectedLocation.address}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Continue Button */}
                    <Button
                        onClick={handleContinue}
                        className="w-full h-12"
                        disabled={!selectedLocation || loading}
                        loading={loading}
                    >
                        Continue
                    </Button>

                    <p className="text-xs text-center text-secondary-500">
                        You can change this later in your profile settings
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LocationSetup;
