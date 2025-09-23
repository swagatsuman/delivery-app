import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    BarChart3,
    Settings,
    Truck,
    MapPin
} from 'lucide-react';

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/orders', icon: ShoppingBag },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/profile', icon: Settings }
];

export const Sidebar: React.FC = () => {
    return (
        <div className="w-64 bg-surface shadow-swiggy border-r border-secondary-200 h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6 border-b border-secondary-200">
                <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
                        <Truck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-secondary-900">FoodEats</h2>
                        <p className="text-xs text-secondary-500">Delivery Partner</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4">
                <ul className="space-y-2">
                    {sidebarItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.href}
                                className={({ isActive }) =>
                                    `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
                                }
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                <span className="font-medium">{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};
