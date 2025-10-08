import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import {
    fetchUsers,
    updateUserStatus,
    setFilters,
    setPagination
} from '../../store/slices/userSlice';
import type { User, UserFilters } from '../../types';
import { Download, Search, Filter, Eye, Check, X, Ban, Users as UsersIcon } from 'lucide-react';
import { formatDate, getRoleColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Users: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { users, loading, filters, pagination, error } = useAppSelector(state => state.users);

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        dispatch(fetchUsers({ filters, page: pagination.page, limit: pagination.limit }));
    }, [dispatch, filters, pagination.page, pagination.limit]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleFiltersChange = (newFilters: Partial<UserFilters>) => {
        dispatch(setFilters(newFilters));
        dispatch(setPagination({ page: 1 }));
    };

    const handleResetFilters = () => {
        dispatch(setFilters({ role: 'all', status: 'all', search: '' }));
    };

    const handleViewDetails = (user: User) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    const handleUpdateStatus = async (uid: string, status: string) => {
        try {
            await dispatch(updateUserStatus({ uid, status })).unwrap();
            toast.success(`User ${status} successfully`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user status');
        }
    };

    const getStats = () => {
        return {
            total: users.length,
            customers: users.filter(u => u.role === 'customer').length,
            restaurants: users.filter(u => u.role === 'restaurant').length,
            deliveryAgents: users.filter(u => u.role === 'delivery_agent').length,
            pending: users.filter(u => u.status === 'pending').length
        };
    };

    const stats = getStats();

    const columns = [
        {
            key: 'user',
            title: 'User',
            render: (_, record: User) => (
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                            {record.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <div className="font-medium text-secondary-900">{record.name}</div>
                        <div className="text-sm text-secondary-500">{record.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'role',
            title: 'Role',
            render: (_, record: User) => (
                <Badge variant="default">
                    {record.role.replace('_', ' ')}
                </Badge>
            )
        },
        {
            key: 'phone',
            title: 'Phone',
            render: (_, record: User) => record.phone || 'N/A'
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
                    <Icon
                        icon={<Eye />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDetails(record)}
                    />

                    {record.status === 'pending' && (
                        <>
                            <Button
                                size="sm"
                                variant="primary"
                                icon={<Check className="h-4 w-4" />}
                                onClick={() => handleUpdateStatus(record.uid, 'active')}
                            />
                            <Button
                                size="sm"
                                variant="danger"
                                icon={<X className="h-4 w-4" />}
                                onClick={() => handleUpdateStatus(record.uid, 'inactive')}
                            />
                        </>
                    )}

                    {record.status === 'active' && (
                        <Button
                            size="sm"
                            variant="danger"
                            icon={<Ban className="h-4 w-4" />}
                            onClick={() => handleUpdateStatus(record.uid, 'suspended')}
                        />
                    )}

                    {record.status === 'suspended' && (
                        <Button
                            size="sm"
                            variant="primary"
                            icon={<Check className="h-4 w-4" />}
                            onClick={() => handleUpdateStatus(record.uid, 'active')}
                        />
                    )}
                </div>
            )
        }
    ];

    return (
        <Layout title="User Management">
            <div className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Total Users</p>
                                <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <UsersIcon className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Customers</p>
                                <p className="text-2xl font-bold text-green-600">{stats.customers}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <div className="h-6 w-6 bg-green-600 rounded"></div>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Restaurants</p>
                                <p className="text-2xl font-bold text-primary-600">{stats.restaurants}</p>
                            </div>
                            <div className="p-3 bg-primary-100 rounded-lg">
                                <div className="h-6 w-6 bg-primary-600 rounded"></div>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Delivery Agents</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.deliveryAgents}</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <div className="h-6 w-6 bg-orange-600 rounded"></div>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Pending</p>
                                <p className="text-2xl font-bold text-warning-600">{stats.pending}</p>
                            </div>
                            <div className="p-3 bg-warning-100 rounded-lg">
                                <div className="h-6 w-6 bg-warning-600 rounded"></div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card padding="md">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-secondary-900 flex items-center">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </h3>
                        <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                            Reset
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="input-field pl-10"
                                value={filters.search}
                                onChange={(e) => handleFiltersChange({ search: e.target.value })}
                            />
                        </div>

                        <select
                            className="input-field"
                            value={filters.role}
                            onChange={(e) => handleFiltersChange({ role: e.target.value as any })}
                        >
                            <option value="all">All Roles</option>
                            <option value="customer">Customer</option>
                            <option value="restaurant">Restaurant</option>
                            <option value="delivery_agent">Delivery Agent</option>
                        </select>

                        <select
                            className="input-field"
                            value={filters.status}
                            onChange={(e) => handleFiltersChange({ status: e.target.value as any })}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>

                        <Button
                            variant="secondary"
                            icon={<Download className="h-4 w-4" />}
                        >
                            Export
                        </Button>
                    </div>
                </Card>

                {/* Users Table */}
                <Card>
                    <div className="flex items-center justify-between mb-6 pb-0">
                        <div>
                            <h2 className="text-lg font-semibold text-secondary-900">
                                Users ({pagination.total})
                            </h2>
                            <p className="text-sm text-secondary-600">
                                Manage user accounts and permissions
                            </p>
                        </div>
                    </div>

                    <div className="pb-6">
                        <Table
                            columns={columns}
                            data={users}
                            loading={loading}
                            emptyMessage="No users found"
                        />
                    </div>
                </Card>
            </div>

            {/* User Details Modal */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedUser(null);
                }}
                title="User Details"
                size="lg"
            >
                {selectedUser && (
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Name</label>
                                <p className="text-secondary-900">{selectedUser.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
                                <p className="text-secondary-900">{selectedUser.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Phone</label>
                                <p className="text-secondary-900">{selectedUser.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Role</label>
                                <Badge variant="default">{selectedUser.role.replace('_', ' ')}</Badge>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Status</label>
                                <Badge
                                    variant={
                                        selectedUser.status === 'active' ? 'success' :
                                            selectedUser.status === 'pending' ? 'warning' :
                                                selectedUser.status === 'suspended' ? 'error' : 'default'
                                    }
                                >
                                    {selectedUser.status}
                                </Badge>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Joined</label>
                                <p className="text-secondary-900">{formatDate(selectedUser.createdAt)}</p>
                            </div>
                        </div>

                        {/* Restaurant Details */}
                        {selectedUser.role === 'restaurant' && selectedUser.restaurantDetails && (
                            <div className="border-t border-secondary-200 pt-6">
                                <h4 className="text-lg font-medium text-secondary-900 mb-4">Restaurant Details</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1">Business Name</label>
                                        <p className="text-secondary-900">{selectedUser.restaurantDetails.businessName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1">GSTIN</label>
                                        <p className="text-secondary-900">{selectedUser.restaurantDetails.gstin}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1">Cuisine Types</label>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedUser.restaurantDetails.cuisineTypes.map((cuisine) => (
                                                <Badge key={cuisine} variant="default" size="sm">
                                                    {cuisine}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1">Rating</label>
                                        <p className="text-secondary-900">
                                            {selectedUser.restaurantDetails.rating.toFixed(1)} ({selectedUser.restaurantDetails.totalRatings} reviews)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delivery Agent Details */}
                        {selectedUser.role === 'delivery_agent' && selectedUser.deliveryAgentDetails && (
                            <div className="border-t border-secondary-200 pt-6">
                                <h4 className="text-lg font-medium text-secondary-900 mb-4">Delivery Agent Details</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1">Vehicle Type</label>
                                        <p className="text-secondary-900 capitalize">{selectedUser.deliveryAgentDetails.vehicleType}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1">Vehicle Number</label>
                                        <p className="text-secondary-900">{selectedUser.deliveryAgentDetails.vehicleNumber}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1">License Number</label>
                                        <p className="text-secondary-900">{selectedUser.deliveryAgentDetails.licenseNumber}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1">Rating</label>
                                        <p className="text-secondary-900">
                                            {selectedUser.deliveryAgentDetails.rating.toFixed(1)} ({selectedUser.deliveryAgentDetails.totalRatings} reviews)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default Users;
