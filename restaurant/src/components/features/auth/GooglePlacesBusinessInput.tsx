import React, { useRef, useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

interface GooglePlacesBusinessInputProps {
    label: string;
    value?: string;
    onChange: (value: string) => void;
    onPlaceSelected: (place: {
        businessName: string;
        address: {
            street: string;
            city: string;
            state: string;
            pincode: string;
            coordinates: { lat: number; lng: number };
        };
    }) => void;
    error?: string;
    placeholder?: string;
}

declare global {
    interface Window {
        google: any;
        initGooglePlaces: () => void;
    }
}

export const GooglePlacesBusinessInput: React.FC<GooglePlacesBusinessInputProps> = ({
                                                                                        label,
                                                                                        value,
                                                                                        onChange,
                                                                                        onPlaceSelected,
                                                                                        error,
                                                                                        placeholder = "Search for your business..."
                                                                                    }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);
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
                types: ['establishment'],
                fields: ['name', 'formatted_address', 'address_components', 'geometry', 'place_id'],
                componentRestrictions: {country: 'IN'}
            });

            autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
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
            const businessName = place.name || '';
            const addressComponents = place.address_components || [];

            let street = '';
            let city = '';
            let state = '';
            let pincode = '';

            addressComponents.forEach((component: any) => {
                const types = component.types;

                if (types.includes('street_number')) {
                    street = component.long_name + ' ';
                } else if (types.includes('route')) {
                    street += component.long_name;
                } else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
                    if (!street) street = component.long_name;
                } else if (types.includes('locality')) {
                    city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                } else if (types.includes('postal_code')) {
                    pincode = component.long_name;
                }
            });

            if (!street && place.formatted_address) {
                const addressParts = place.formatted_address.split(',');
                street = addressParts[0]?.trim() || '';
            }

            const coordinates = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            };

            onChange(businessName);

            onPlaceSelected({
                businessName,
                address: {
                    street: street.trim(),
                    city: city.trim(),
                    state: state.trim(),
                    pincode: pincode.trim(),
                    coordinates
                }
            });

        } catch (error) {
            console.error('Error processing place selection:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const handleInputFocus = () => {
        if (!isGoogleLoaded && !loadAttempted) {
            loadGoogleMapsAPI();
        }
    };

    const clearInput = () => {
        onChange('');
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-secondary-700">
                {label}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isLoading ? (
                        <div
                            className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                    ) : (
                        <Search className="h-4 w-4 text-secondary-400"/>
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    className={`input-field pl-10 pr-10 ${error ? 'border-error-500 focus:ring-error-500' : ''}`}
                    autoComplete="off"
                />
                {value && (
                    <button
                        type="button"
                        onClick={clearInput}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600"
                    >
                        <X className="h-4 w-4"/>
                    </button>
                )}
            </div>

            <div className="text-xs text-secondary-500">
                {isGoogleLoaded ? (
                    "Search and select your business to auto-fill address details"
                ) : loadAttempted ? (
                    "Loading Google Places... You can type manually"
                ) : (
                    "Click to enable Google Places search or type manually"
                )}
            </div>

            {error && (
                <p className="text-sm text-error-600">{error}</p>
            )}
        </div>
    );
};
