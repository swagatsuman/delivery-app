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

export const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
                                                                        onPlaceSelect,
                                                                        placeholder = "Search for area, street name...",
                                                                        className
                                                                    }) => {
    const [value, setValue] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Mock suggestions for demo - replace with actual Google Places API
    const mockSuggestions = [
        {
            description: "Koramangala, Bangalore, Karnataka",
            coordinates: {lat: 12.9351929, lng: 77.62448069999999},
            city: "Bangalore",
            state: "Karnataka",
            pincode: "560034"
        },
        {
            description: "Indiranagar, Bangalore, Karnataka",
            coordinates: {lat: 12.9698196, lng: 77.6382433},
            city: "Bangalore",
            state: "Karnataka",
            pincode: "560038"
        },
        {
            description: "Whitefield, Bangalore, Karnataka",
            coordinates: {lat: 12.9698196, lng: 77.7499721},
            city: "Bangalore",
            state: "Karnataka",
            pincode: "560066"
        }
    ];

    useEffect(() => {
        if (value.length > 2) {
            // Filter mock suggestions based on input
            const filtered = mockSuggestions.filter(place =>
                place.description.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [value]);

    const handlePlaceSelect = (place: any) => {
        setValue(place.description);
        setShowSuggestions(false);
        onPlaceSelect({
            address: place.description,
            coordinates: place.coordinates,
            city: place.city,
            state: place.state,
            pincode: place.pincode
        });
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coordinates = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    // Mock reverse geocoding
                    setValue("Current Location");
                    onPlaceSelect({
                        address: "Current Location",
                        coordinates,
                        city: "Bangalore",
                        state: "Karnataka",
                        pincode: "560001"
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    };

    return (
        <div className={`relative ${className}`}>
            <Input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                icon={<Search className="h-5 w-5"/>}
            />

            {/* Current Location Button */}
            <button
                type="button"
                onClick={getCurrentLocation}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-primary-600 hover:text-primary-700"
            >
                <MapPin className="h-5 w-5"/>
            </button>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {suggestions.map((place, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handlePlaceSelect(place)}
                            className="w-full text-left p-3 hover:bg-secondary-50 border-b border-secondary-100 last:border-b-0"
                        >
                            <div className="flex items-center space-x-3">
                                <MapPin className="h-4 w-4 text-secondary-500 flex-shrink-0"/>
                                <span className="text-secondary-900">{place.description}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
