import React from 'react';
import { Card } from '../../ui/Card.tsx';
import { ShoppingBag, IndianRupee, Clock, Star, Menu, TrendingUp } from 'lucide-react';
import type { DashboardStats } from '../../../types';
import { formatCurrency, formatNumber } from '../../../utils/helpers';

interface StatsCardsProps {
    stats: DashboardStats | null;
    loading: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
    if (loading || !stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <div className="h-20 bg-secondary-200 rounded"></div>
                    </Card>
                ))}
            </div>
        );
    }

    const statsCards = [
        {
            title: "Today's Orders",
            value: formatNumber(stats.todayOrders),
            icon: ShoppingBag,
            color: 'bg-blue-100 text-blue-600',
            subtitle: `${stats.pendingOrders} pending`
        },
        {
            title: "Today's Revenue",
            value: formatCurrency(stats.todayRevenue),
            icon: IndianRupee,
            color: 'bg-success-100 text-success-600'
        },
        {
            title: 'Pending Orders',
            value: formatNumber(stats.pendingOrders),
            icon: Clock,
            color: 'bg-warning-100 text-warning-600'
        },
        {
            title: 'Completed Orders',
            value: formatNumber(stats.completedOrders),
            icon: TrendingUp,
            color: 'bg-green-100 text-green-600'
        },
        {
            title: 'Average Order Value',
            value: formatCurrency(stats.averageOrderValue),
            icon: IndianRupee,
            color: 'bg-purple-100 text-purple-600'
        },
        {
            title: 'Menu Items',
            value: formatNumber(stats.totalMenuItems),
            icon: Menu,
            color: 'bg-primary-100 text-primary-600'
        },
        {
            title: 'Average Rating',
            value: stats.averageRating.toFixed(1),
            icon: Star,
            color: 'bg-yellow-100 text-yellow-600',
            subtitle: `${stats.totalReviews} reviews`
        },
        {
            title: 'Total Reviews',
            value: formatNumber(stats.totalReviews),
            icon: Star,
            color: 'bg-orange-100 text-orange-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
                <Card key={index} padding="md">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
                            <p className="text-2xl font-bold text-secondary-900 mt-1">{stat.value}</p>
                            {stat.subtitle && (
                                <p className="text-xs text-secondary-500 mt-1">{stat.subtitle}</p>
                            )}
                        </div>
                        <div className={`p-3 rounded-lg ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};
