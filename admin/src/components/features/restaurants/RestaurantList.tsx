import React from 'react';
import { Table } from '../../ui/Table.tsx';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import type { RestaurantDetails, User } from '../../../types';
import { getStatusColor, formatDate, formatCurrency } from '../../../utils/helpers';
import { Eye, Check, X, Ban } from 'lucide-react';

interface RestaurantListProps {
    restaurants: RestaurantDetails[];
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
                <div>
                    <div className="font-medium text-secondary-900">
                        {record.restaurantDetails?.businessName || 'N/A'}
                    </div>
                    <div className="text-sm text-secondary-500">
                        {record.restaurantDetails?.gstin || 'No GSTIN'}
                    </div>
                </div>
            )
        },
        {
            key: 'owner',
            title: 'Owner',
            render: (_, record: User) => (
                <div>
                    <div className="font-medium text-secondary-900">{record.name}</div>
                    <div className="text-sm text-secondary-500">{record.email}</div>
                </div>
            )
        },
        {
            key: 'cuisine',
            title: 'Cuisine Types',
            render: (_, record: User) => (
                <div className="flex flex-wrap gap-1">
                    {record.restaurantDetails?.cuisineTypes.slice(0, 2).map((cuisine) => (
                        <Badge key={cuisine} variant="default" size="sm">
                            {cuisine}
                        </Badge>
                    ))}
                    {(record.restaurantDetails?.cuisineTypes.length || 0) > 2 && (
                        <Badge variant="default" size="sm">
                            +{(record.restaurantDetails?.cuisineTypes.length || 0) - 2} more
                        </Badge>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            title: 'Status',
            render: (_, record: User) => (
                <Badge
                    variant={
                        record.status === 'active' ? 'success' :
                            record.status === 'pending' ? 'warning' :
                                record.status === 'suspended' ? 'error' : 'default'
                    }
                >
                    {record.status}
                </Badge>
            )
        },
        {
            key: 'stats',
            title: 'Stats',
            render: (_, record: User) => (
                <div className="text-sm">
                    <div>Orders: {record.restaurantDetails?.totalOrders || 0}</div>
                    <div>Revenue: {formatCurrency(record.restaurantDetails?.revenue || 0)}</div>
                    <div>Rating: {(record.restaurantDetails?.rating || 0).toFixed(1)}</div>
                </div>
            )
        },
        {
            key: 'joined',
            title: 'Joined',
            render: (_, record: User) => (
                <div className="text-sm text-secondary-600">
                    {formatDate(record.createdAt)}
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
                        icon={<Eye className="h-4 w-4" />}
                        onClick={() => onViewDetails(record)}
                    />

                    {record.status === 'pending' && (
                        <>
                            <Button
                                size="sm"
                                variant="primary"
                                icon={<Check className="h-4 w-4" />}
                                onClick={() => onUpdateStatus(record.uid, 'active')}
                            />
                            <Button
                                size="sm"
                                variant="danger"
                                icon={<X className="h-4 w-4" />}
                                onClick={() => onUpdateStatus(record.uid, 'inactive')}
                            />
                        </>
                    )}

                    {record.status === 'active' && (
                        <Button
                            size="sm"
                            variant="danger"
                            icon={<Ban className="h-4 w-4" />}
                            onClick={() => onUpdateStatus(record.uid, 'suspended')}
                        />
                    )}
                </div>
            )
        }
    ];

    return (
        <Table
            columns={columns}
            data={restaurants}
            loading={loading}
            emptyMessage="No restaurants found"
        />
    );
};
