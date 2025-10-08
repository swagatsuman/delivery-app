import React from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { ShoppingBag, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

const Orders: React.FC = () => {
    // Placeholder data - in real implementation, this would come from Redux store
    const orders = [];
    const loading = false;

    const stats = {
        total: 0,
        pending: 0,
        confirmed: 0,
        delivered: 0,
        cancelled: 0
    };

    const columns = [
        {
            key: 'orderId',
            title: 'Order ID',
            render: (_, record: any) => (
                <div className="font-medium text-secondary-900">#{record.orderId}</div>
            )
        },
        {
            key: 'customer',
            title: 'Customer',
            render: (_, record: any) => (
                <div>
                    <div className="font-medium text-secondary-900">{record.customerName}</div>
                    <div className="text-sm text-secondary-500">{record.customerEmail}</div>
                </div>
            )
        },
        {
            key: 'establishment',
            title: 'Establishment',
            render: (_, record: any) => record.establishmentName
        },
        {
            key: 'items',
            title: 'Items',
            render: (_, record: any) => record.itemsCount
        },
        {
            key: 'total',
            title: 'Total',
            render: (_, record: any) => `₹${record.total.toFixed(2)}`
        },
        {
            key: 'status',
            title: 'Status',
            render: (_, record: any) => (
                <Badge
                    variant={
                        record.status === 'delivered' ? 'success' :
                        record.status === 'confirmed' ? 'info' :
                        record.status === 'pending' ? 'warning' :
                        record.status === 'cancelled' ? 'error' : 'default'
                    }
                >
                    {record.status}
                </Badge>
            )
        },
        {
            key: 'date',
            title: 'Date',
            render: (_, record: any) => (
                <div className="text-sm text-secondary-600">
                    {new Date(record.createdAt).toLocaleDateString()}
                </div>
            )
        }
    ];

    return (
        <Layout title="Orders">
            <div className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Total Orders</p>
                                <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <ShoppingBag className="h-6 w-6 text-blue-600" />
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
                                <Clock className="h-6 w-6 text-warning-600" />
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Confirmed</p>
                                <p className="text-2xl font-bold text-info-600">{stats.confirmed}</p>
                            </div>
                            <div className="p-3 bg-info-100 rounded-lg">
                                <Truck className="h-6 w-6 text-info-600" />
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Delivered</p>
                                <p className="text-2xl font-bold text-success-600">{stats.delivered}</p>
                            </div>
                            <div className="p-3 bg-success-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-success-600" />
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Cancelled</p>
                                <p className="text-2xl font-bold text-error-600">{stats.cancelled}</p>
                            </div>
                            <div className="p-3 bg-error-100 rounded-lg">
                                <XCircle className="h-6 w-6 text-error-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Orders Table */}
                <Card>
                    <div className="flex items-center justify-between mb-6 pb-0">
                        <div>
                            <h2 className="text-lg font-semibold text-secondary-900">
                                All Orders ({stats.total})
                            </h2>
                            <p className="text-sm text-secondary-600">
                                Manage and track all orders
                            </p>
                        </div>
                    </div>

                    <div className="pb-6">
                        <Table
                            columns={columns}
                            data={orders}
                            loading={loading}
                            emptyMessage="No orders found"
                        />
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default Orders;
