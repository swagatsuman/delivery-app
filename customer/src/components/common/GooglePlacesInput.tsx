import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import type { Coordinates } from '../../types';

interface GooglePlacesInputProps {
    onPlaceSelect: (place: {
        address: string;
        coordinates: Coordinates;
        city: string;
        state: string;
        pincode: string;
    }) => void;
    placeholder?: string;
    className?: string;
}

declare global {
    interface Window {
        google: any;
        initGooglePlaces: () => void;
    }
}

export const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
                                                                        onPlaceSelect,
                                                                        placeholder = "Search for area, street name...",
                                                                        className
                                                                    }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);
    const geocoderRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    const [loadAttempted, setLoadAttempted] = useState(false);

    // Check if Google is already loaded
    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
            setIsGoogleLoaded(true);
            initializeAutocomplete();
        }
    }, []);

    const loadGoogleMapsAPI = () => {
        if (loadAttempted) return;
        setLoadAttempted(true);

        const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            console.warn('Google Places API key not found. Using manual input mode.');
            return;
        }

        // Check if script already exists
        if (document.getElementById('google-maps-script')) {
            return;
        }

        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
        script.async = true;
        script.defer = true;

        window.initGooglePlaces = () => {
            setIsGoogleLoaded(true);
            initializeAutocomplete();
        };

        script.onerror = () => {
            console.error('Failed to load Google Places API');
        };

        document.head.appendChild(script);
    };

    const initializeAutocomplete = () => {
        if (!inputRef.current || !window.google?.maps?.places) return;

        try {
            // Clean up existing autocomplete
            if (autocompleteRef.current) {
                window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
            }

            autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['geocode'],
                fields: ['formatted_address', 'address_components', 'geometry', 'place_id'],
                componentRestrictions: { country: 'IN' }
            });

            autocompleteRef.current.addListener('place_changed', handlePlaceSelect);

            // Initialize geocoder
            geocoderRef.current = new window.google.maps.Geocoder();
        } catch (error) {
            console.error('Error initializing autocomplete:', error);
        }
    };

    const handlePlaceSelect = () => {
        if (!autocompleteRef.current) return;

        const place = autocompleteRef.current.getPlace();
        if (!place || !place.geometry?.location) return;

        setIsLoading(true);

        try {
            const addressComponents = place.address_components || [];

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

            const coordinates = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            };

            onPlaceSelect({
                address: place.formatted_address || '',
                coordinates,
                city: city.trim(),
                state: state.trim(),
                pincode: pincode.trim()
            });

        } catch (error) {
            console.error('Error processing place selection:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }

        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coordinates = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                if (geocoderRef.current) {
                    // Use Google's reverse geocoding for accurate address
                    geocoderRef.current.geocode(
                        { location: coordinates },
                        (results: any[], status: any) => {
                            setIsLoading(false);

                            if (status === 'OK' && results[0]) {
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

                                if (inputRef.current) {
                                    inputRef.current.value = result.formatted_address;
                                }

                                onPlaceSelect({
                                    address: result.formatted_address,
                                    coordinates,
                                    city: city.trim(),
                                    state: state.trim(),
                                    pincode: pincode.trim()
                                });
                            } else {
                                console.error('Reverse geocoding failed:', status);
                                alert('Unable to get address for your location. Please try searching manually.');
                            }
                        }
                    );
                } else {
                    setIsLoading(false);
                    alert('Google Maps not loaded. Please try searching manually.');
                }
            },
            (error) => {
                setIsLoading(false);
                console.error("Error getting location:", error);
                alert('Unable to get your current location. Please try searching manually.');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    };

    const handleInputFocus = () => {
        if (!isGoogleLoaded && !loadAttempted) {
            loadGoogleMapsAPI();
        }
    };

    return (
        <div className={`space-y-1 ${className}`}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isLoading ? (
                        <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                    ) : (
                        <Search className="h-5 w-5 text-secondary-400" />
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pl-12 pr-12 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-surface text-lg"
                    autoComplete="off"
                />
                <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-primary-600 hover:text-primary-700 disabled:opacity-50"
                    title="Get current location"
                >
                    <MapPin className="h-5 w-5" />
                </button>
            </div>

            <div className="text-xs text-secondary-500">
                {isGoogleLoaded ? (
                    "Search and select your location or use current location"
                ) : loadAttempted ? (
                    "Loading Google Places... You can type manually"
                ) : (
                    "Click to enable Google Places search"
                )}
            </div>
        </div>
    );
};