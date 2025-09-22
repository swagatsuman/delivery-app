import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../hooks/useAppDispatch';

export const LocationHeader: React.FC = () => {
    const navigate = useNavigate();
    const { currentLocation } = useAppSelector(state => state.location);

    const handleLocationClick = () => {
        navigate('/addresses');
    };

    return (
        <div className="bg-primary-500 text-white px-4 py-4">
            <button
                onClick={handleLocationClick}
                className="flex items-center space-x-2 w-full"
            >
                <MapPin className="h-5 w-5 text-primary-100" />
                <div className="flex-1 text-left">
                    <p className="text-sm text-primary-100">Deliver to</p>
                    <p className="font-semibold text-white truncate">
                        {currentLocation ? currentLocation.label : 'Select Location'}
                    </p>
                </div>
                <ChevronDown className="h-5 w-5 text-primary-100" />
            </button>
        </div>
    );
};
