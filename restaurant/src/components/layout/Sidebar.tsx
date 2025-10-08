import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getEstablishmentMenuItems, getEstablishmentLabel, getEstablishmentIcon } from '../../utils/establishmentConfig';
import type { EstablishmentType } from '../../types';


export const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const { user } = useAuth();
    const establishmentType = (user?.establishmentDetails?.establishmentType || 'restaurant') as EstablishmentType;
    const sidebarItems = getEstablishmentMenuItems(establishmentType);
    const establishmentLabel = getEstablishmentLabel(establishmentType);
    const EstablishmentIcon = getEstablishmentIcon(establishmentType);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-surface shadow-swiggy border-r border-secondary-200 h-screen sticky top-0 flex flex-col transition-all duration-300`}>
            {/* Logo */}
            <div className="h-[73px] border-b border-secondary-200 flex items-center justify-between px-6">
                {!isCollapsed && (
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
                            <EstablishmentIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-secondary-900">FoodEats</h2>
                            <p className="text-xs text-secondary-500">{establishmentLabel} Panel</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-5 w-5 text-secondary-600" />
                    ) : (
                        <ChevronLeft className="h-5 w-5 text-secondary-600" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 flex-1 overflow-y-auto scrollbar-hide">
                <ul className="space-y-2">
                    {sidebarItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.href}
                                className={({ isActive }) =>
                                    `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
                                }
                                title={isCollapsed ? item.name : item.description}
                            >
                                <item.icon className={`h-5 w-5 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
                                {!isCollapsed && <span className="font-medium">{item.name}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};
