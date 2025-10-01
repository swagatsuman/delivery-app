import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MapPin, Star, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { Badge } from '../../ui/Badge';
import { Loading } from '../../ui/Loading';
import type { User } from '../../../types';

interface EstablishmentListProps {
    establishments: User[];
    loading: boolean;
    error: string | null;
    onRetry?: () => void;
}

export const EstablishmentList: React.FC<EstablishmentListProps> = ({
    establishments,
    loading,
    error,
    onRetry
}) => {
    const navigate = useNavigate();

    if (loading) {
        return <Loading />;
    }

    if (error) {
        const isIndexError = error.includes('index') || error.includes('composite');
        return (
            <Card>
                <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">
                        {isIndexError ? 'Database Index Required' : 'Error loading establishments'}
                    </h3>
                    <p className="text-secondary-600 mb-4">{error}</p>
                    {isIndexError && (
                        <div className="text-sm text-secondary-500 bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                            <p className="font-medium text-yellow-800 mb-2">Database Setup Required:</p>
                            <p>Firebase needs an index for this query. Quick fixes:</p>
                            <ul className="text-left mt-2 space-y-1">
                                <li><strong>Option 1:</strong> Click the Firebase Console link in browser console → Wait 2-5 minutes → Refresh</li>
                                <li><strong>Option 2:</strong> Check if your Firebase collection is named 'users' and has establishment records</li>
                                <li><strong>Option 3:</strong> Contact your developer to set up the database indexes</li>
                            </ul>
                        </div>
                    )}
                    {onRetry && (
                        <div
                            className="flex items-center justify-center space-x-2 text-primary-600 hover:text-primary-700 cursor-pointer transition-colors px-4 py-2 bg-primary-50 hover:bg-primary-100 rounded-lg mt-4"
                            onClick={onRetry}
                        >
                            <Icon icon={<RefreshCw />} size="sm" variant="primary" />
                            <span className="text-sm font-medium">Try Again</span>
                        </div>
                    )}
                </div>
            </Card>
        );
    }

    if (establishments.length === 0) {
        return (
            <Card>
                <div className="text-center py-8">
                    <div className="h-12 w-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="h-6 w-6 text-secondary-400" />
                    </div>
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">No establishments found</h3>
                    <p className="text-secondary-600">No establishments match your current filters.</p>
                </div>
            </Card>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'pending': return 'warning';
            case 'suspended': return 'error';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-4 w-4" />;
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'suspended': return <XCircle className="h-4 w-4" />;
            default: return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getEstablishmentTypeDisplay = (type: string) => {
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="space-y-4">
            {establishments.map((establishment) => {
                const details = establishment.establishmentDetails;
                return (
                    <Card key={establishment.uid} className="hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {/* Business Logo/Icon */}
                                <div className="h-16 w-16 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <span className="text-primary-600 font-bold text-lg">
                                        {(details?.businessName || establishment.name).charAt(0).toUpperCase()}
                                    </span>
                                </div>

                                {/* Establishment Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <h3 className="text-lg font-medium text-secondary-900 truncate">
                                            {details?.businessName || establishment.name}
                                        </h3>
                                        <Badge variant={getStatusColor(establishment.status)}>
                                            <div className="flex items-center space-x-1">
                                                {getStatusIcon(establishment.status)}
                                                <span className="capitalize">{establishment.status}</span>
                                            </div>
                                        </Badge>
                                        {details?.establishmentType && (
                                            <Badge variant="outline">
                                                {getEstablishmentTypeDisplay(details.establishmentType)}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-4 text-sm text-secondary-600">
                                        <span>{establishment.email}</span>
                                        {details?.address && (
                                            <div className="flex items-center space-x-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{details.address.city}</span>
                                            </div>
                                        )}
                                        {details?.rating && (
                                            <div className="flex items-center space-x-1">
                                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                <span>{details.rating.toFixed(1)}</span>
                                                <span>({details.totalRatings})</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cuisine Types */}
                                    {details?.cuisineTypes && details.cuisineTypes.length > 0 && (
                                        <div className="flex items-center space-x-2 mt-2">
                                            {details.cuisineTypes.slice(0, 3).map((cuisine) => (
                                                <span
                                                    key={cuisine}
                                                    className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full text-xs"
                                                >
                                                    {cuisine}
                                                </span>
                                            ))}
                                            {details.cuisineTypes.length > 3 && (
                                                <span className="text-xs text-secondary-500">
                                                    +{details.cuisineTypes.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Statistics & Actions */}
                            <div className="flex items-center space-x-6">
                                <div className="text-right">
                                    <div className="text-sm text-secondary-600">Orders</div>
                                    <div className="font-medium text-secondary-900">{details?.totalOrders || 0}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-secondary-600">Revenue</div>
                                    <div className="font-medium text-secondary-900">₹{details?.revenue || 0}</div>
                                </div>
                                <div
                                    className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600 cursor-pointer transition-colors px-3 py-2 hover:border-primary-300"
                                    onClick={() => navigate(`/establishments/${establishment.uid}`)}
                                >
                                    <span className="text-sm font-medium">View Details</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};
