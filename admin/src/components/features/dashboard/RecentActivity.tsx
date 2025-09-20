import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { formatRelativeTime, getRoleColor } from '../../../utils/helpers';
import { User, Store, UserPlus, AlertCircle } from 'lucide-react';

interface RecentActivityProps {
    activities: any[];
    loading: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities, loading }) => {
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'user_registration':
                return UserPlus;
            case 'restaurant_approval':
                return Store;
            case 'order_placed':
                return AlertCircle;
            default:
                return User;
        }
    };

    const getActivityMessage = (activity: any) => {
        switch (activity.type) {
            case 'user_registration':
                return `New ${activity.role} registered: ${activity.name}`;
            case 'restaurant_approval':
                return `Restaurant ${activity.businessName} approved`;
            case 'order_placed':
                return `New order placed: ${activity.orderNumber}`;
            default:
                return 'Activity recorded';
        }
    };

    if (loading) {
        return (
            <Card title="Recent Activity" padding="md">
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="animate-pulse flex items-center space-x-3">
                            <div className="h-8 w-8 bg-secondary-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                                <div className="h-3 bg-secondary-200 rounded w-1/2 mt-1"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card title="Recent Activity" padding="md">
            <div className="space-y-4">
                {activities.length === 0 ? (
                    <p className="text-secondary-500 text-center py-8">No recent activity</p>
                ) : (
                    activities.map((activity, index) => {
                        const Icon = getActivityIcon(activity.type);
                        return (
                            <div key={index} className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                                        <Icon className="h-4 w-4 text-primary-600" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-secondary-900">{getActivityMessage(activity)}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <p className="text-xs text-secondary-500">
                                            {/*{formatRelativeTime(activity.createdAt)}*/}
                                        </p>
                                        {activity.role && (
                                            <Badge variant="default" size="sm">
                                                {activity.role}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </Card>
    );
};
