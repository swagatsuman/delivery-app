import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Input } from '../ui/Input';
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
    const [value, setValue] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    const [loadAttempted, setLoadAttempted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteServiceRef = useRef<any>(null);
    const placesServiceRef = useRef<any>(null);
    const geocoderRef = useRef<any>(null);

    // Check if Google is already loaded
    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
            setIsGoogleLoaded(true);
            initializeServices();
        }
    }, []);

    const loadGoogleMapsAPI = () => {
        if (loadAttempted) return;
        setLoadAttempted(true);

        const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            console.warn('Google Places API key not found. Using fallback mode.');
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
            initializeServices();
        };

        script.onerror = () => {
            console.error('Failed to load Google Places API');
        };

        document.head.appendChild(script);
    };

    const initializeServices = () => {
        if (!window.google?.maps?.places) return;

        try {
            autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
            placesServiceRef.current = new window.google.maps.places.PlacesService(
                document.createElement('div')
            );
            geocoderRef.current = new window.google.maps.Geocoder();
        } catch (error) {
            console.error('Error initializing Google Places services:', error);
        }
    };

    const searchPlaces = (query: string) => {
        if (!autocompleteServiceRef.current || !query) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoading(true);

        const request = {
            input: query,
            componentRestrictions: { country: 'IN' },
            types: ['geocode', 'establishment']
        };

        autocompleteServiceRef.current.getPlacePredictions(request, (predictions: any[], status: any) => {
            setIsLoading(false);

            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                setSuggestions(predictions);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
        });
    };

    useEffect(() => {
        if (value.length > 2 && isGoogleLoaded) {
            const timeoutId = setTimeout(() => {
                searchPlaces(value);
            }, 300); // Debounce API calls

            return () => clearTimeout(timeoutId);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [value, isGoogleLoaded]);

    const getPlaceDetails = (placeId: string, description: string) => {
        if (!placesServiceRef.current) return;

        const request = {
            placeId: placeId,
            fields: ['name', 'formatted_address', 'address_components', 'geometry']
        };

        placesServiceRef.current.getDetails(request, (place: any, status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                processPlaceData(place, description);
            } else {
                console.error('Failed to get place details:', status);
            }
        });
    };

    const processPlaceData = (place: any, fallbackDescription: string) => {
        const addressComponents = place.address_components || [];

        let city = '';
        let state = '';
        let pincode = '';

        addressComponents.forEach((component: any) => {
            const types = component.types;

            if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
                state = component.long_name;
            } else if (types.includes('postal_code')) {
                pincode = component.long_name;
            }
        });

        const coordinates = place.geometry?.location ? {
            lat: typeof place.geometry.location.lat === 'function'
                ? place.geometry.location.lat()
                : place.geometry.location.lat,
            lng: typeof place.geometry.location.lng === 'function'
                ? place.geometry.location.lng()
                : place.geometry.location.lng
        } : { lat: 0, lng: 0 };

        onPlaceSelect({
            address: place.formatted_address || fallbackDescription,
            coordinates,
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim()
        });
    };

    const handlePlaceSelect = (place: any) => {
        setValue(place.description);
        setShowSuggestions(false);

        if (place.place_id) {
            getPlaceDetails(place.place_id, place.description);
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

                                    if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                                        city = component.long_name;
                                    } else if (types.includes('administrative_area_level_1')) {
                                        state = component.long_name;
                                    } else if (types.includes('postal_code')) {
                                        pincode = component.long_name;
                                    }
                                });

                                setValue("Current Location");
                                onPlaceSelect({
                                    address: result.formatted_address,
                                    coordinates,
                                    city: city.trim(),
                                    state: state.trim(),
                                    pincode: pincode.trim()
                                });
                            } else {
                                console.error('Reverse geocoding failed:', status);
                                // Fallback to basic current location
                    setValue("Current Location");
                    onPlaceSelect({
                        address: "Current Location",
                        coordinates,
                                    city: "Unknown",
                                    state: "Unknown",
                                    pincode: ""
                    });
                            }
                        }
                    );
                } else {
                    setIsLoading(false);
                    setValue("Current Location");
                    onPlaceSelect({
                        address: "Current Location",
                        coordinates,
                        city: "Unknown",
                        state: "Unknown",
                        pincode: ""
                    });
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const handleInputFocus = () => {
        if (!isGoogleLoaded && !loadAttempted) {
            loadGoogleMapsAPI();
        }
    };

    return (
        <div className={`relative ${className}`}>
            <Input
                ref={inputRef}
                value={value}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder={placeholder}
                icon={isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                    <Search className="h-5 w-5" />
                )}
            />

            {/* Current Location Button */}
            <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-primary-600 hover:text-primary-700 disabled:opacity-50"
                title="Get current location"
            >
                <MapPin className="h-5 w-5" />
            </button>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {suggestions.map((place, index) => (
                        <button
                            key={place.place_id || index}
                            type="button"
                            onClick={() => handlePlaceSelect(place)}
                            className="w-full text-left p-3 hover:bg-secondary-50 border-b border-secondary-100 last:border-b-0 focus:bg-secondary-50 focus:outline-none"
                        >
                            <div className="flex items-center space-x-3">
                                <MapPin className="h-4 w-4 text-secondary-500 flex-shrink-0" />
                                <div>
                                    <span className="text-secondary-900 block">
                                        {place.structured_formatting?.main_text || place.description}
                                    </span>
                                    {place.structured_formatting?.secondary_text && (
                                        <span className="text-secondary-600 text-sm">
                                            {place.structured_formatting.secondary_text}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Status message */}
            <div className="text-xs text-secondary-500 mt-1">
                {!isGoogleLoaded && !loadAttempted ? (
                    "Click to enable Google Places search"
                ) : !isGoogleLoaded && loadAttempted ? (
                    "Loading Google Places..."
                ) : isGoogleLoaded ? (
                    "Search for places or use current location"
                ) : (
                    "Type to search locations"
                )}
            </div>
        </div>
    );
};
