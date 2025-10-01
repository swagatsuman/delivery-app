import React from 'react';
import { Card } from '../../ui/Card';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Building2, Truck, BarChart3, Settings, Eye, ChefHat, Car, ShoppingCart, Cake, Coffee, Store } from 'lucide-react';
import type { EstablishmentType } from '../../../types';

interface QuickActionsProps {
    pendingEstablishments: number;
    pendingDeliveryAgents: number;
    establishmentsByType: Record<EstablishmentType, number>;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
                                                              pendingEstablishments,
                                                              pendingDeliveryAgents,
                                                              establishmentsByType
                                                          }) => {
    const navigate = useNavigate();

    const actions = [
        {
            title: 'Review Establishments',
            description: `${pendingEstablishments} pending approvals`,
            icon: Building2,
            onClick: () => navigate('/establishments?status=pending'),
            variant: 'primary' as const,
            disabled: pendingEstablishments === 0
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

    const establishmentTypeActions = [
        {
            title: 'Restaurants',
            count: establishmentsByType.restaurant || 0,
            icon: ChefHat,
            onClick: () => navigate('/establishments?type=restaurant'),
            color: 'text-orange-600'
        },
        {
            title: 'Food Trucks',
            count: establishmentsByType.food_truck || 0,
            icon: Car,
            onClick: () => navigate('/establishments?type=food_truck'),
            color: 'text-blue-600'
        },
        {
            title: 'Grocery Shops',
            count: establishmentsByType.grocery_shop || 0,
            icon: ShoppingCart,
            onClick: () => navigate('/establishments?type=grocery_shop'),
            color: 'text-green-600'
        },
        {
            title: 'Bakeries',
            count: establishmentsByType.bakery || 0,
            icon: Cake,
            onClick: () => navigate('/establishments?type=bakery'),
            color: 'text-pink-600'
        },
        {
            title: 'Cafés',
            count: establishmentsByType.cafe || 0,
            icon: Coffee,
            onClick: () => navigate('/establishments?type=cafe'),
            color: 'text-amber-600'
        },
        {
            title: 'Cloud Kitchens',
            count: establishmentsByType.cloud_kitchen || 0,
            icon: Store,
            onClick: () => navigate('/establishments?type=cloud_kitchen'),
            color: 'text-purple-600'
        }
    ];

    return (
        <div className="space-y-6">
            <Card title="Quick Actions" padding="md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {actions.map((action, index) => (
                        <div
                            key={index}
                            className={`border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors cursor-pointer ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={action.disabled ? undefined : action.onClick}
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

            <Card title="Browse by Establishment Type" padding="md">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {establishmentTypeActions.map((action, index) => (
                        <div
                            key={index}
                            className="border border-secondary-200 rounded-lg p-3 hover:bg-secondary-50 transition-colors cursor-pointer text-center"
                            onClick={action.onClick}
                        >
                            <div className="flex flex-col items-center space-y-2">
                                <action.icon className={`h-6 w-6 ${action.color}`} />
                                <div>
                                    <p className="text-lg font-bold text-secondary-900">{action.count}</p>
                                    <p className="text-xs text-secondary-600">{action.title}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
