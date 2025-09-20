import React from 'react';
import { Card } from '../../ui/Card';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Store, Truck, BarChart3, Settings, Eye } from 'lucide-react';

interface QuickActionsProps {
    pendingRestaurants: number;
    pendingDeliveryAgents: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
                                                              pendingRestaurants,
                                                              pendingDeliveryAgents
                                                          }) => {
    const navigate = useNavigate();

    const actions = [
        {
            title: 'Review Restaurants',
            description: `${pendingRestaurants} pending approvals`,
            icon: Store,
            onClick: () => navigate('/restaurants?filter=pending'),
            variant: 'primary' as const,
            disabled: pendingRestaurants === 0
        },
        {
            title: 'Review Agents',
            description: `${pendingDeliveryAgents} pending approvals`,
            icon: Truck,
            onClick: () => navigate('/delivery-agents?filter=pending'),
            variant: 'primary' as const,
            disabled: pendingDeliveryAgents === 0
        },
        {
            title: 'View Analytics',
            description: 'Detailed performance metrics',
            icon: BarChart3,
            onClick: () => navigate('/analytics'),
            variant: 'secondary' as const
        },
        {
            title: 'Manage Users',
            description: 'User management & roles',
            icon: UserPlus,
            onClick: () => navigate('/users'),
            variant: 'secondary' as const
        },
        {
            title: 'View Orders',
            description: 'Monitor all orders',
            icon: Eye,
            onClick: () => navigate('/orders'),
            variant: 'secondary' as const
        },
        {
            title: 'Settings',
            description: 'Platform configuration',
            icon: Settings,
            onClick: () => navigate('/settings'),
            variant: 'secondary' as const
        }
    ];

    return (
        <Card title="Quick Actions" padding="md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {actions.map((action, index) => (
                    <div
                        key={index}
                        className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors cursor-pointer"
                        onClick={action.onClick}
                    >
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <action.icon className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-secondary-900">{action.title}</h4>
                                <p className="text-xs text-secondary-600 mt-1">{action.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
