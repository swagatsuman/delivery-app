import React from 'react';
import { MapPin, Edit, Trash2, Star } from 'lucide-react';
import type { Address } from '../../../types';

interface AddressCardProps {
    address: Address;
    onEdit: (address: Address) => void;
    onDelete: (addressId: string) => void;
    onSetDefault: (addressId: string) => void;
    onSelect?: (address: Address) => void;
    isSelected?: boolean;
    showActions?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
                                                            address,
                                                            onEdit,
                                                            onDelete,
                                                            onSetDefault,
                                                            onSelect,
                                                            isSelected = false,
                                                            showActions = true
                                                        }) => {
    const handleCardClick = () => {
        if (onSelect) {
            onSelect(address);
        }
    };

    return (
        <div
            className={`p-4 bg-surface border rounded-xl transition-all ${
                isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-200 hover:border-secondary-300'
            } ${onSelect ? 'cursor-pointer' : ''}`}
            onClick={handleCardClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-secondary-500" />
                        <span className="font-medium text-secondary-900">{address.label}</span>
                        {address.isDefault && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                    </div>

                    {address.name && (
                        <p className="text-sm text-secondary-700 mb-1">{address.name}</p>
                    )}

                    <p className="text-sm text-secondary-600 mb-1">{address.address}</p>

                    {address.landmark && (
                        <p className="text-xs text-secondary-500">Near {address.landmark}</p>
                    )}

                    <p className="text-xs text-secondary-500 mt-1">
                        {address.city}, {address.state} - {address.pincode}
                    </p>

                    {address.phone && (
                        <p className="text-xs text-secondary-500">Phone: {address.phone}</p>
                    )}
                </div>

                {showActions && (
                    <div className="flex items-center space-x-2 ml-4">
                        {!address.isDefault && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSetDefault(address.id);
                                }}
                                className="p-2 text-secondary-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Set as default"
                            >
                                <Star className="h-4 w-4" />
                            </button>
                        )}

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(address);
                            }}
                            className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit address"
                        >
                            <Edit className="h-4 w-4" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(address.id);
                            }}
                            className="p-2 text-secondary-500 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                            title="Delete address"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
