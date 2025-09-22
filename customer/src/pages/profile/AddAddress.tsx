import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, User, Phone } from 'lucide-react';
import { TopHeader } from '../../components/layout/TopHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { GooglePlacesInput } from '../../components/common/GooglePlacesInput';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addAddress, updateAddress } from '../../store/slices/locationSlice';
import { validateForm, VALIDATION_RULES } from '../../utils/validation';
import type { Address, Coordinates } from '../../types';

const AddAddress: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();

    const editingAddress = location.state?.address as Address | undefined;
    const isEditing = !!editingAddress;

    const [formData, setFormData] = useState({
        label: editingAddress?.label || 'Home',
        name: editingAddress?.name || '',
        phone: editingAddress?.phone || '',
        address: editingAddress?.address || '',
        landmark: editingAddress?.landmark || '',
        city: editingAddress?.city || '',
        state: editingAddress?.state || '',
        pincode: editingAddress?.pincode || '',
        coordinates: editingAddress?.coordinates || {lat: 0, lng: 0}
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);

    const addressLabels = ['Home', 'Work', 'Hotel', 'Other'];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({...prev, [field]: ''}));
        }
    };

    const handlePlaceSelect = (place: any) => {
        setFormData(prev => ({
            ...prev,
            address: place.address,
            city: place.city,
            state: place.state,
            pincode: place.pincode,
            coordinates: place.coordinates
        }));
    };

    const handleSubmit = async () => {
        // Validate form
        const validationErrors = validateForm(formData, {
            address: VALIDATION_RULES.address,
            city: {required: true, message: 'City is required'},
            state: {required: true, message: 'State is required'},
            pincode: VALIDATION_RULES.pincode,
            ...(formData.phone && {phone: VALIDATION_RULES.phone})
        });

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);

            const addressData = {
                ...formData,
                userId: 'current-user' // Replace with actual user ID
            };

            if (isEditing) {
                await dispatch(updateAddress({
                    id: editingAddress.id,
                    data: addressData
                }));
            } else {
                await dispatch(addAddress(addressData));
            }

            navigate(-1);
        } catch (error) {
            console.error('Error saving address:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <TopHeader title={isEditing ? 'Edit Address' : 'Add New Address'}/>

            <div className="p-4 space-y-6">
                {/* Address Search */}
                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Search Location
                    </label>
                    <GooglePlacesInput
                        onPlaceSelect={handlePlaceSelect}
                        placeholder="Search for area, street name..."
                    />
                </div>

                {/* Address Details */}
                <div className="space-y-4">
                    <Input
                        label="Complete Address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="House/Flat No., Building Name, Street"
                        error={errors.address}
                        multiline
                        rows={3}
                    />

                    <Input
                        label="Landmark (Optional)"
                        value={formData.landmark}
                        onChange={(e) => handleInputChange('landmark', e.target.value)}
                        placeholder="E.g. Near Metro Station"
                        error={errors.landmark}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="City"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            placeholder="City"
                            error={errors.city}
                        />
                        <Input
                            label="Pincode"
                            value={formData.pincode}
                            onChange={(e) => handleInputChange('pincode', e.target.value)}
                            placeholder="Pincode"
                            error={errors.pincode}
                        />
                    </div>

                    <Input
                        label="State"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="State"
                        error={errors.state}
                    />
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                    <h3 className="font-medium text-secondary-900">Contact Details (Optional)</h3>

                    <Input
                        label="Name"
                        icon={<User className="h-5 w-5"/>}
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Full name"
                        error={errors.name}
                    />

                    <Input
                        label="Phone Number"
                        icon={<Phone className="h-5 w-5"/>}
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Phone number"
                        error={errors.phone}
                    />
                </div>

                {/* Address Label */}
                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Save as
                    </label>
                    <div className="flex space-x-2">
                        {addressLabels.map((label) => (
                            <button
                                key={label}
                                onClick={() => handleInputChange('label', label)}
                                className={`px-4 py-2 rounded-lg font-medium ${
                                    formData.label === label
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Save Button */}
                <Button
                    onClick={handleSubmit}
                    className="w-full h-12"
                    loading={loading}
                    disabled={!formData.address || !formData.city || !formData.pincode}
                >
                    {isEditing ? 'Update Address' : 'Save Address'}
                </Button>
            </div>
        </div>
    );
};

export default AddAddress;
