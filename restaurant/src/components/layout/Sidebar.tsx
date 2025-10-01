import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getEstablishmentMenuItems, getEstablishmentLabel, getEstablishmentIcon } from '../../utils/establishmentConfig';
import type { EstablishmentType } from '../../types';


export const Sidebar: React.FC = () => {
    const { user } = useAuth();
    const establishmentType = (user?.establishmentDetails?.establishmentType || 'restaurant') as EstablishmentType;
    const sidebarItems = getEstablishmentMenuItems(establishmentType);
    const establishmentLabel = getEstablishmentLabel(establishmentType);
    const EstablishmentIcon = getEstablishmentIcon(establishmentType);

    return (
        <div className="w-64 bg-surface shadow-swiggy border-r border-secondary-200 h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6 border-b border-secondary-200">
                <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
                        <EstablishmentIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-secondary-900">FoodEats</h2>
                        <p className="text-xs text-secondary-500">{establishmentLabel} Panel</p>
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
                                title={item.description}
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
