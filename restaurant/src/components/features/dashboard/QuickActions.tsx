import React from 'react';
import { Card } from '../../ui/Card';
import { useNavigate } from 'react-router-dom';
import { Plus, Menu, ShoppingBag, BarChart3, Settings, Eye } from 'lucide-react';

interface QuickActionsProps {
    pendingOrders: number;
    totalMenuItems: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
                                                              pendingOrders,
                                                              totalMenuItems
                                                          }) => {
    const navigate = useNavigate();

    const actions = [
        {
            title: 'Add Menu Item',
            description: 'Add new dishes to your menu',
            icon: Plus,
            onClick: () => navigate('/menu'),
            variant: 'primary' as const
        },
        {
            title: 'View Orders',
            description: `${pendingOrders} orders pending`,
            icon: ShoppingBag,
            onClick: () => navigate('/orders'),
            variant: 'primary' as const,
            highlighted: pendingOrders > 0
        },
        {
            title: 'Manage Menu',
            description: `${totalMenuItems} items in menu`,
            icon: Menu,
            onClick: () => navigate('/menu'),
            variant: 'secondary' as const
        },
        {
            title: 'View Analytics',
            description: 'Detailed performance metrics',
            icon: BarChart3,
            onClick: () => navigate('/analytics'),
            variant: 'secondary' as const
        },
        {
            title: 'Restaurant Profile',
            description: 'Update restaurant information',
            icon: Settings,
            onClick: () => navigate('/profile'),
            variant: 'secondary' as const
        },
        {
            title: 'View All Orders',
            description: 'Complete order history',
            icon: Eye,
            onClick: () => navigate('/orders'),
            variant: 'secondary' as const
        }
    ];

    return (
        <Card title="Quick Actions" padding="md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {actions.map((action, index) => (
                    <div
                        key={index}
                        className={`border rounded-lg p-4 hover:bg-secondary-50 transition-colors cursor-pointer ${
                            action.highlighted ? 'border-primary-200 bg-primary-50' : 'border-secondary-200'
                        }`}
                        onClick={action.onClick}
                    >
                        <div className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 p-2 rounded-lg ${
                                action.highlighted ? 'bg-primary-100' : 'bg-secondary-100'
                            }`}>
                                <action.icon className={`h-5 w-5 ${
                                    action.highlighted ? 'text-primary-600' : 'text-secondary-600'
                                }`} />
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
