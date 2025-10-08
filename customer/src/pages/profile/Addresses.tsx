import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { TopHeader } from '../../components/layout/TopHeader';
import { AddressCard } from '../../components/features/profile/AddressCard';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import {
    fetchAddresses,
    deleteAddress,
    setDefaultAddress,
    setCurrentLocation
} from '../../store/slices/locationSlice';
import { setDeliveryAddress, recalculateCartPricing } from '../../store/slices/cartSlice';
import type { Address } from '../../types';

const Addresses: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { addresses, loading } = useAppSelector(state => state.location);
    const { user } = useAppSelector(state => state.auth);

    const isSelectMode = location.state?.from === 'cart';
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

    useEffect(() => {
        if (user?.uid) {
            dispatch(fetchAddresses(user.uid));
        }
    }, [dispatch, user]);

    const handleAddAddress = () => {
        navigate('/add-address');
    };

    const handleEditAddress = (address: Address) => {
        navigate('/add-address', { state: { address } });
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (confirm('Are you sure you want to delete this address?')) {
            await dispatch(deleteAddress(addressId));
        }
    };

    const handleSetDefaultAddress = async (addressId: string) => {
        await dispatch(setDefaultAddress(addressId));
    };

    const handleSelectAddress = (address: Address) => {
        if (isSelectMode) {
            setSelectedAddress(address);
        }
    };

    const handleConfirmSelection = async () => {
        if (selectedAddress) {
            dispatch(setCurrentLocation(selectedAddress));
            dispatch(setDeliveryAddress(selectedAddress));
            // Recalculate pricing with new delivery address
            await dispatch(recalculateCartPricing());
            navigate(-1);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <TopHeader
                title="Delivery Addresses"
                rightElement={
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleAddAddress}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                    </Button>
                }
            />

            <div className="p-4">
                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="bg-secondary-200 h-24 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                ) : addresses.length === 0 ? (
                    <EmptyState
                        icon="📍"
                        title="No addresses saved"
                        description="Add your first address to start ordering"
                        actionLabel="Add Address"
                        onAction={handleAddAddress}
                    />
                ) : (
                    <div className="space-y-4">
                        {addresses.map((address) => (
                            <AddressCard
                                key={address.id}
                                address={address}
                                onEdit={handleEditAddress}
                                onDelete={handleDeleteAddress}
                                onSetDefault={handleSetDefaultAddress}
                                onSelect={isSelectMode ? handleSelectAddress : undefined}
                                isSelected={selectedAddress?.id === address.id}
                                showActions={!isSelectMode}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Confirm Selection Button */}
            {isSelectMode && selectedAddress && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-secondary-200">
                    <Button
                        onClick={handleConfirmSelection}
                        className="w-full h-12"
                    >
                        Deliver to this address
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Addresses;
