import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import {
    fetchRestaurantDetails,
    updateRestaurantStatus,
    clearSelectedRestaurant
} from '../../store/slices/restaurantSlice';
import { formatDate, formatCurrency, validateEmail, validatePhone, validateGSTIN } from '../../utils/helpers';
import {
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    Building,
    Star,
    Clock,
    Check,
    X,
    Ban,
    AlertCircle,
    FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

const RestaurantDetail: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {selectedRestaurant, loading, error} = useAppSelector(state => state.restaurants);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedAction, setSelectedAction] = useState<{ action: string; status: string } | null>(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchRestaurantDetails(id));
        }

        return () => {
            dispatch(clearSelectedRestaurant());
        };
    }, [dispatch, id]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleStatusUpdate = async (status: string, action: string) => {
        setSelectedAction({action, status});
        setShowStatusModal(true);
    };

    const confirmStatusUpdate = async () => {
        if (!selectedRestaurant || !selectedAction) return;

        try {
            await dispatch(updateRestaurantStatus({
                uid: selectedRestaurant.uid,
                status: selectedAction.status
            })).unwrap();

            toast.success(`Restaurant ${selectedAction.action.toLowerCase()} successfully`);
            setShowStatusModal(false);
            setSelectedAction(null);

            // Refresh the restaurant details
            if (id) {
                dispatch(fetchRestaurantDetails(id));
            }
        } catch (error: any) {
            toast.error(error.message || `Failed to ${selectedAction.action.toLowerCase()} restaurant`);
        }
    };

    if (loading) {
        return (
            <Layout title="Restaurant Details">
                <Loading fullScreen text="Loading restaurant details..."/>
            </Layout>
        );
    }

    if (!selectedRestaurant) {
        return (
            <Layout title="Restaurant Details">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <AlertCircle className="h-16 w-16 text-error-400 mx-auto mb-4"/>
                        <h3 className="text-lg font-medium text-secondary-900 mb-2">Restaurant Not Found</h3>
                        <p className="text-secondary-600 mb-4">The restaurant you're looking for doesn't exist.</p>
                        <Button onClick={() => navigate('/restaurants')}>
                            <ArrowLeft className="h-4 w-4 mr-2"/>
                            Back to Restaurants
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    const restaurant = selectedRestaurant;
    const details = restaurant.restaurantDetails;

    return (
        <Layout
            title={details?.businessName || restaurant.name}
            actions={
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/restaurants')}
                    icon={<ArrowLeft className="h-4 w-4"/>}
                >
                    Back to Restaurants
                </Button>
            }
        >
            <div className="p-6 space-y-6">
                {/* Header */}
                <Card padding="md">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            <div className="h-20 w-20 bg-primary-100 rounded-xl flex items-center justify-center">
                                <Building className="h-10 w-10 text-primary-600"/>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                                    {details?.businessName || 'Business Name Not Set'}
                                </h1>
                                <div className="flex items-center space-x-4 text-sm text-secondary-600">
                                    <span>ID: {restaurant.uid}</span>
                                    <span>•</span>
                                    <span>Registered: {formatDate(restaurant.createdAt)}</span>
                                </div>
                                <div className="flex items-center space-x-3 mt-3">
                                    <Badge
                                        variant={
                                            restaurant.status === 'active' ? 'success' :
                                                restaurant.status === 'pending' ? 'warning' :
                                                    restaurant.status === 'suspended' ? 'error' : 'default'
                                        }
                                        size="md"
                                    >
                                        {restaurant.status.toUpperCase()}
                                    </Badge>

                                    {/*{details && (
                                        <Badge variant={details.isActive ? 'success' : 'error'} size="md">
                                            {details.isActive ? 'Restaurant Active' : 'Restaurant Inactive'}
                                        </Badge>
                                    )}*/}

                                    <Badge variant={details?.operatingHours?.isOpen ? 'info' : 'error'} size="md">
                                        Currently {details?.operatingHours?.isOpen ? 'Open' : 'Closed'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            {restaurant.status === 'pending' && (
                                <>
                                    <Button
                                        variant="primary"
                                        icon={<Check className="h-4 w-4"/>}
                                        onClick={() => handleStatusUpdate('active', 'Approved')}
                                    >
                                        Approve Restaurant
                                    </Button>
                                    <Button
                                        variant="danger"
                                        icon={<X className="h-4 w-4"/>}
                                        onClick={() => handleStatusUpdate('inactive', 'Rejected')}
                                    >
                                        Reject Restaurant
                                    </Button>
                                </>
                            )}

                            {restaurant.status === 'active' && (
                                <Button
                                    variant="danger"
                                    icon={<Ban className="h-4 w-4"/>}
                                    onClick={() => handleStatusUpdate('suspended', 'Suspended')}
                                >
                                    Suspend Restaurant
                                </Button>
                            )}

                            {(restaurant.status === 'suspended' || restaurant.status === 'inactive') && (
                                <Button
                                    variant="primary"
                                    icon={<Check className="h-4 w-4"/>}
                                    onClick={() => handleStatusUpdate('active', 'Reactivated')}
                                >
                                    Reactivate Restaurant
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact Information */}
                        <Card title="Contact Information" padding="md">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-secondary-700 mb-3">Owner Details</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="h-8 w-8 bg-secondary-100 rounded-full flex items-center justify-center">
                                                <span className="text-secondary-600 font-medium text-sm">
                                                    {restaurant.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-secondary-900">{restaurant.name}</p>
                                                <p className="text-sm text-secondary-500">Owner</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Mail className="h-4 w-4 text-secondary-400"/>
                                            <div>
                                                <p className="text-secondary-900">{restaurant.email}</p>
                                                <p className="text-xs text-secondary-500">
                                                    {validateEmail(restaurant.email) ? 'Valid email' : 'Invalid email format'}
                                                </p>
                                            </div>
                                        </div>

                                        {restaurant.phone && (
                                            <div className="flex items-center space-x-3">
                                                <Phone className="h-4 w-4 text-secondary-400"/>
                                                <div>
                                                    <p className="text-secondary-900">{restaurant.phone}</p>
                                                    <p className="text-xs text-secondary-500">
                                                        {validatePhone(restaurant.phone) ? 'Valid phone' : 'Invalid phone format'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-secondary-700 mb-3">Business Details</h4>
                                    <div className="space-y-3">
                                        {details?.gstin && (
                                            <div className="flex items-center space-x-3">
                                                <FileText className="h-4 w-4 text-secondary-400"/>
                                                <div>
                                                    <p className="text-secondary-900">{details.gstin}</p>
                                                    <p className="text-xs text-secondary-500">
                                                        {validateGSTIN(details.gstin) ? 'Valid GSTIN' : 'Invalid GSTIN format'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {details?.operatingHours && (
                                            <div className="flex items-center space-x-3">
                                                <Clock className="h-4 w-4 text-secondary-400"/>
                                                <div>
                                                    <p className="text-secondary-900">
                                                        {details.operatingHours.open} - {details.operatingHours.close}
                                                    </p>
                                                    <p className="text-xs text-secondary-500">Operating hours</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Address Information */}
                        {details?.address && (
                            <Card title="Address" padding="md">
                                <div className="flex items-start space-x-3">
                                    <MapPin className="h-5 w-5 text-secondary-400 mt-1 flex-shrink-0"/>
                                    <div>
                                        <p className="font-medium text-secondary-900">{details.address.label}</p>
                                        <p className="text-secondary-700 mt-1">
                                            {details.address.street}<br/>
                                            {details.address.city}, {details.address.state}<br/>
                                            {details.address.pincode}
                                        </p>
                                        {details.address.coordinates && (
                                            <p className="text-xs text-secondary-500 mt-2">
                                                Coordinates: {details.address.coordinates.lat}, {details.address.coordinates.lng}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Cuisine Types */}
                        {details?.cuisineTypes && details.cuisineTypes.length > 0 && (
                            <Card title="Cuisine Types" padding="md">
                                <div className="flex flex-wrap gap-2">
                                    {details.cuisineTypes.map((cuisine) => (
                                        <Badge key={cuisine} variant="default">
                                            {cuisine}
                                        </Badge>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Description */}
                        {details?.description && (
                            <Card title="Restaurant Description" padding="md">
                                <p className="text-secondary-700 leading-relaxed">{details.description}</p>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Business Stats */}
                        <Card title="Business Statistics" padding="md">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-secondary-600">Total Orders:</span>
                                    <span
                                        className="font-semibold text-secondary-900">{details?.totalOrders || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-secondary-600">Revenue:</span>
                                    <span
                                        className="font-semibold text-secondary-900">{formatCurrency(details?.revenue || 0)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-secondary-600">Rating:</span>
                                    <div className="flex items-center space-x-1">
                                        <Star className="h-4 w-4 text-yellow-400"/>
                                        <span className="font-semibold text-secondary-900">
                                            {details?.rating ? details.rating.toFixed(1) : 'N/A'}
                                        </span>
                                        {details?.totalRatings && (
                                            <span className="text-sm text-secondary-500">({details.totalRatings})</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Account Status */}
                        <Card title="Account Status" padding="md">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-secondary-600">Account Status:</span>
                                    <Badge
                                        variant={
                                            restaurant.status === 'active' ? 'success' :
                                                restaurant.status === 'pending' ? 'warning' :
                                                    restaurant.status === 'suspended' ? 'error' : 'default'
                                        }
                                    >
                                        {restaurant.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-secondary-600">Created:</span>
                                    <span
                                        className="text-sm text-secondary-900">{formatDate(restaurant.createdAt)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-secondary-600">Last Updated:</span>
                                    <span
                                        className="text-sm text-secondary-900">{formatDate(restaurant.updatedAt)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Status Update Confirmation Modal */}
            <Modal
                isOpen={showStatusModal}
                onClose={() => {
                    setShowStatusModal(false);
                    setSelectedAction(null);
                }}
                title="Confirm Action"
            >
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <AlertCircle className="h-8 w-8 text-warning-600"/>
                        <div>
                            <h3 className="text-lg font-medium text-secondary-900">
                                {selectedAction?.action} Restaurant
                            </h3>
                            <p className="text-secondary-600">
                                Are you sure you want
                                to {selectedAction?.action.toLowerCase()} "{details?.businessName || restaurant.name}"?
                            </p>
                        </div>
                    </div>

                    {selectedAction?.status === 'suspended' && (
                        <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                            <p className="text-sm text-warning-800">
                                <strong>Warning:</strong> Suspending this restaurant will:
                            </p>
                            <ul className="text-sm text-warning-700 mt-2 space-y-1">
                                <li>• Close the restaurant immediately</li>
                                <li>• Prevent new orders from being placed</li>
                                <li>• Hide the restaurant from customer app</li>
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowStatusModal(false);
                                setSelectedAction(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={selectedAction?.status === 'suspended' ? 'danger' : 'primary'}
                            onClick={confirmStatusUpdate}
                        >
                            {selectedAction?.action}
                        </Button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
};

export default RestaurantDetail;
