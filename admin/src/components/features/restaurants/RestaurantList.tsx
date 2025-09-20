import React from 'react';
import { Table } from '../../ui/Table';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import type { User } from '../../../types';
import { formatDate } from '../../../utils/helpers';
import { Eye, Check, X, Ban, MapPin, Phone, Mail } from 'lucide-react';

interface RestaurantListProps {
    restaurants: User[];
    loading: boolean;
    onViewDetails: (restaurant: User) => void;
    onUpdateStatus: (uid: string, status: string) => void;
}

export const RestaurantList: React.FC<RestaurantListProps> = ({
                                                                  restaurants,
                                                                  loading,
                                                                  onViewDetails,
                                                                  onUpdateStatus
                                                              }) => {
    const columns = [
        {
            key: 'restaurant',
            title: 'Restaurant',
            render: (_, record: User) => (
                <div className="flex items-center space-x-3">
                    <div>
                        <div className="font-medium text-secondary-900">
                            {record.restaurantDetails?.businessName || 'Business Name Not Set'}
                        </div>
                        <div className="text-sm text-secondary-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1"/>
                            {record.email}
                        </div>
                        {record.restaurantDetails?.gstin && (
                            <div className="text-xs text-secondary-400">
                                GSTIN: {record.restaurantDetails.gstin}
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'owner',
            title: 'Owner Details',
            render: (_, record: User) => (
                <div>
                    <div className="font-medium text-secondary-900">{record.name}</div>
                    {record.phone && (
                        <div className="text-sm text-secondary-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1"/>
                            {record.phone}
                        </div>
                    )}
                    {record.restaurantDetails?.address && (
                        <div className="text-xs text-secondary-400 flex items-center">
                            <MapPin className="h-3 w-3 mr-1"/>
                            {record.restaurantDetails.address.city}, {record.restaurantDetails.address.state}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            title: 'Account Status',
            render: (_, record: User) => (
                <div className="space-y-1">
                    <Badge
                        variant={
                            record.status === 'active' ? 'success' :
                                record.status === 'pending' ? 'warning' :
                                    record.status === 'suspended' ? 'error' : 'default'
                        }
                    >
                        {record.status}
                    </Badge>
                    {record.restaurantDetails && (
                        <div className="text-xs">
                            {record.restaurantDetails.isActive ? (
                                <span className="text-success-600">● Restaurant Active</span>
                            ) : (
                                <span className="text-error-600">● Restaurant Inactive</span>
                            )}
                        </div>
                    )}
                    {record.restaurantDetails?.operatingHours?.isOpen && (
                        <div className="text-xs text-success-600">
                            Currently Open
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'joined',
            title: 'Registration',
            render: (_, record: User) => (
                <div className="text-sm">
                    <div className="text-secondary-900 font-medium">
                        {formatDate(record.createdAt)}
                    </div>
                </div>
            )
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (_, record: User) => (
                <div className="flex items-center space-x-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        icon={<Eye className="h-4 w-4"/>}
                        onClick={() => onViewDetails(record)}
                        title="View Details"
                    />

                    {record.status === 'pending' && (
                        <>
                            <Button
                                size="sm"
                                variant="primary"
                                icon={<Check className="h-4 w-4"/>}
                                onClick={() => {
                                    if (window.confirm(`Approve ${record.restaurantDetails?.businessName || record.name}?`)) {
                                        onUpdateStatus(record.uid, 'active');
                                    }
                                }}
                                title="Approve Restaurant"
                            />
                            <Button
                                size="sm"
                                variant="danger"
                                icon={<X className="h-4 w-4"/>}
                                onClick={() => {
                                    if (window.confirm(`Reject ${record.restaurantDetails?.businessName || record.name}?`)) {
                                        onUpdateStatus(record.uid, 'inactive');
                                    }
                                }}
                                title="Reject Restaurant"
                            />
                        </>
                    )}

                    {record.status === 'active' && (
                        <Button
                            size="sm"
                            variant="danger"
                            icon={<Ban className="h-4 w-4"/>}
                            onClick={() => {
                                if (window.confirm(`Suspend ${record.restaurantDetails?.businessName || record.name}? This will close their restaurant and prevent new orders.`)) {
                                    onUpdateStatus(record.uid, 'suspended');
                                }
                            }}
                            title="Suspend Restaurant"
                        />
                    )}

                    {record.status === 'suspended' && (
                        <Button
                            size="sm"
                            variant="primary"
                            icon={<Check className="h-4 w-4"/>}
                            onClick={() => {
                                if (window.confirm(`Reactivate ${record.restaurantDetails?.businessName || record.name}?`)) {
                                    onUpdateStatus(record.uid, 'active');
                                }
                            }}
                            title="Reactivate Restaurant"
                        />
                    )}

                    {record.status === 'inactive' && (
                        <Button
                            size="sm"
                            variant="primary"
                            icon={<Check className="h-4 w-4"/>}
                            onClick={() => {
                                if (window.confirm(`Activate ${record.restaurantDetails?.businessName || record.name}?`)) {
                                    onUpdateStatus(record.uid, 'active');
                                }
                            }}
                            title="Activate Restaurant"
                        />
                    )}
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({length: 5}).map((_, index) => (
                    <div key={index} className="animate-pulse border border-secondary-200 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-secondary-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-secondary-200 rounded w-1/3"></div>
                                <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                            </div>
                            <div className="h-8 w-20 bg-secondary-200 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <Table
            columns={columns}
            data={restaurants}
            loading={loading}
            emptyMessage="No restaurants found"
        />
    );
};
