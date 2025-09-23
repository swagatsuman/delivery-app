import React from 'react';
import { Table } from '../../ui/Table';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import type { User } from '../../../types';
import { formatDate, formatCurrency } from '../../../utils/helpers';
import { Eye, Check, X, Ban, Phone, Mail, Car, Star } from 'lucide-react';

interface DeliveryAgentListProps {
    deliveryAgents: User[];
    loading: boolean;
    onViewDetails: (agent: User) => void;
    onUpdateStatus: (uid: string, status: string) => void;
}

export const DeliveryAgentList: React.FC<DeliveryAgentListProps> = ({
                                                                        deliveryAgents,
                                                                        loading,
                                                                        onViewDetails,
                                                                        onUpdateStatus
                                                                    }) => {
    const getVehicleIcon = (vehicleType: string) => {
        switch (vehicleType) {
            case 'bike':
                return '🏍️';
            case 'bicycle':
                return '🚴';
            case 'car':
                return '🚗';
            default:
                return <Car className="h-4 w-4" />;
        }
    };

    const columns = [
        {
            key: 'agent',
            title: 'Agent',
            render: (_, record: User) => (
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                            {record.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <div className="font-medium text-secondary-900">{record.name}</div>
                        <div className="text-sm text-secondary-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {record.email}
                        </div>
                        {record.phone && (
                            <div className="text-sm text-secondary-500 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {record.phone}
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'vehicle',
            title: 'Vehicle Details',
            render: (_, record: User) => (
                <div>
                    {record.deliveryAgentDetails ? (
                        <>
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="text-lg">{getVehicleIcon(record.deliveryAgentDetails.vehicleType)}</span>
                                <span className="font-medium text-secondary-900 capitalize">
                                    {record.deliveryAgentDetails.vehicleType}
                                </span>
                            </div>
                            <div className="text-sm text-secondary-600">
                                {record.deliveryAgentDetails.vehicleNumber}
                            </div>
                            <div className="text-xs text-secondary-500">
                                License: {record.deliveryAgentDetails.licenseNumber}
                            </div>
                        </>
                    ) : (
                        <span className="text-sm text-secondary-500">Details not available</span>
                    )}
                </div>
            )
        },
        {
            key: 'performance',
            title: 'Performance',
            render: (_, record: User) => (
                <div className="space-y-1">
                    {record.deliveryAgentDetails ? (
                        <>
                            <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-400" />
                                <span className="text-sm font-medium">
                                    {record.deliveryAgentDetails.averageRating?.toFixed(1) || '0.0'}
                                </span>
                                <span className="text-xs text-secondary-500">
                                    ({record.deliveryAgentDetails.totalRatings || 0})
                                </span>
                            </div>
                            <div className="text-xs text-secondary-600">
                                {record.deliveryAgentDetails.completedDeliveries || 0} deliveries
                            </div>
                            <div className="text-xs text-success-600">
                                {formatCurrency(record.deliveryAgentDetails.earnings || 0)} earned
                            </div>
                        </>
                    ) : (
                        <span className="text-xs text-secondary-500">No data</span>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            title: 'Status',
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
                </div>
            )
        },
        {
            key: 'documents',
            title: 'Documents',
            render: (_, record: User) => (
                <div className="text-xs space-y-1">
                    {record.deliveryAgentDetails?.kycDocuments ? (
                        <>
                            <div className="flex items-center space-x-2">
                                <Badge
                                    variant={record.deliveryAgentDetails.kycDocuments.aadhar ? 'success' : 'error'}
                                    size="sm"
                                >
                                    Aadhar
                                </Badge>
                                <Badge
                                    variant={record.deliveryAgentDetails.kycDocuments.license ? 'success' : 'error'}
                                    size="sm"
                                >
                                    License
                                </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Badge
                                    variant={record.deliveryAgentDetails.kycDocuments.pan ? 'success' : 'error'}
                                    size="sm"
                                >
                                    PAN
                                </Badge>
                                <Badge
                                    variant={record.deliveryAgentDetails.kycDocuments.photo ? 'success' : 'error'}
                                    size="sm"
                                >
                                    Photo
                                </Badge>
                            </div>
                        </>
                    ) : (
                        <span className="text-secondary-500">Not uploaded</span>
                    )}
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
                        title="View Details"
                    />

                    {record.status === 'pending' && (
                        <>
                            <Button
                                size="sm"
                                variant="primary"
                                icon={<Check className="h-4 w-4" />}
                                onClick={() => {
                                    if (window.confirm(`Approve ${record.name} as delivery agent?`)) {
                                        onUpdateStatus(record.uid, 'active');
                                    }
                                }}
                                title="Approve Agent"
                            />
                            <Button
                                size="sm"
                                variant="danger"
                                icon={<X className="h-4 w-4" />}
                                onClick={() => {
                                    if (window.confirm(`Reject ${record.name}'s application?`)) {
                                        onUpdateStatus(record.uid, 'inactive');
                                    }
                                }}
                                title="Reject Agent"
                            />
                        </>
                    )}

                    {record.status === 'active' && (
                        <Button
                            size="sm"
                            variant="danger"
                            icon={<Ban className="h-4 w-4" />}
                            onClick={() => {
                                if (window.confirm(`Suspend ${record.name}? This will prevent them from taking new orders.`)) {
                                    onUpdateStatus(record.uid, 'suspended');
                                }
                            }}
                            title="Suspend Agent"
                        />
                    )}

                    {record.status === 'suspended' && (
                        <Button
                            size="sm"
                            variant="primary"
                            icon={<Check className="h-4 w-4" />}
                            onClick={() => {
                                if (window.confirm(`Reactivate ${record.name}?`)) {
                                    onUpdateStatus(record.uid, 'active');
                                }
                            }}
                            title="Reactivate Agent"
                        />
                    )}

                    {record.status === 'inactive' && (
                        <Button
                            size="sm"
                            variant="primary"
                            icon={<Check className="h-4 w-4" />}
                            onClick={() => {
                                if (window.confirm(`Activate ${record.name}?`)) {
                                    onUpdateStatus(record.uid, 'active');
                                }
                            }}
                            title="Activate Agent"
                        />
                    )}
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
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
            data={deliveryAgents}
            loading={loading}
            emptyMessage="No delivery agents found"
        />
    );
};
