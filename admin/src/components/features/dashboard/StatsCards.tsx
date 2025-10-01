import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Store, Users, Truck, IndianRupee, ShoppingBag, TrendingUp, Building2, ChefHat, Car, ShoppingCart, Cake, Coffee } from 'lucide-react';
import type { DashboardStats } from '../../../types';
import { formatCurrency, formatNumber, calculateGrowth } from '../../../utils/helpers';

interface StatsCardsProps {
    stats: DashboardStats | null;
    loading: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
    if (loading || !stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <div className="h-20 bg-secondary-200 rounded"></div>
                    </Card>
                ))}
            </div>
        );
    }

    const statsCards = [
        {
            title: 'Total Establishments',
            value: formatNumber(stats.totalEstablishments),
            icon: Building2,
            color: 'bg-blue-100 text-blue-600',
            badge: stats.pendingEstablishments > 0 ? {
                text: `${stats.pendingEstablishments} pending`,
                variant: 'warning' as const
            } : null
        },
        {
            title: 'Approved Establishments',
            value: formatNumber(stats.approvedEstablishments),
            icon: Building2,
            color: 'bg-green-100 text-green-600'
        },
        {
            title: 'Total Customers',
            value: formatNumber(stats.totalCustomers),
            icon: Users,
            color: 'bg-purple-100 text-purple-600'
        },
        {
            title: 'Delivery Agents',
            value: formatNumber(stats.totalDeliveryAgents),
            icon: Truck,
            color: 'bg-orange-100 text-orange-600',
            badge: stats.pendingDeliveryAgents > 0 ? {
                text: `${stats.pendingDeliveryAgents} pending`,
                variant: 'warning' as const
            } : null
        },
        {
            title: 'Total Orders',
            value: formatNumber(stats.totalOrders),
            icon: ShoppingBag,
            color: 'bg-primary-100 text-primary-600',
            subtitle: `${stats.todayOrders} today`
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            icon: IndianRupee,
            color: 'bg-green-100 text-green-600',
            subtitle: `${formatCurrency(stats.todayRevenue)} today`
        }
    ];

    const establishmentTypeStats = [
        {
            title: 'Restaurants',
            value: stats.establishmentsByType.restaurant || 0,
            icon: ChefHat,
            color: 'bg-orange-100 text-orange-600'
        },
        {
            title: 'Food Trucks',
            value: stats.establishmentsByType.food_truck || 0,
            icon: Car,
            color: 'bg-blue-100 text-blue-600'
        },
        {
            title: 'Grocery Shops',
            value: stats.establishmentsByType.grocery_shop || 0,
            icon: ShoppingCart,
            color: 'bg-green-100 text-green-600'
        },
        {
            title: 'Bakeries',
            value: stats.establishmentsByType.bakery || 0,
            icon: Cake,
            color: 'bg-pink-100 text-pink-600'
        },
        {
            title: 'Cafés',
            value: stats.establishmentsByType.cafe || 0,
            icon: Coffee,
            color: 'bg-amber-100 text-amber-600'
        },
        {
            title: 'Cloud Kitchens',
            value: stats.establishmentsByType.cloud_kitchen || 0,
            icon: Store,
            color: 'bg-purple-100 text-purple-600'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {statsCards.map((stat, index) => (
                    <Card key={index} padding="md">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-secondary-900 mt-1">{stat.value}</p>
                                {stat.subtitle && (
                                    <p className="text-xs text-secondary-500 mt-1">{stat.subtitle}</p>
                                )}
                                {stat.badge && (
                                    <Badge variant={stat.badge.variant} size="sm" className="mt-2">
                                        {stat.badge.text}
                                    </Badge>
                                )}
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Establishment Types Breakdown */}
            <Card title="Establishments by Type" padding="md">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {establishmentTypeStats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className={`p-3 rounded-lg ${stat.color} inline-flex mb-2`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <p className="text-2xl font-bold text-secondary-900">{formatNumber(stat.value)}</p>
                            <p className="text-sm text-secondary-600">{stat.title}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
