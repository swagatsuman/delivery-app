import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Store,
    Users,
    Truck,
    ShoppingBag,
    BarChart3,
    Settings,
    ChefHat,
    Building2,
    Coffee,
    Car,
    ShoppingCart,
    Cake,
    ChevronDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface SidebarItem {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    subItems?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Establishments', href: '/establishments', icon: Building2, subItems: [
        { name: 'All Establishments', href: '/establishments', icon: Building2 },
        { name: 'Restaurants', href: '/establishments?type=restaurant', icon: ChefHat },
        { name: 'Food Trucks', href: '/establishments?type=food_truck', icon: Car },
        { name: 'Grocery Shops', href: '/establishments?type=grocery_shop', icon: ShoppingCart },
        { name: 'Bakeries', href: '/establishments?type=bakery', icon: Cake },
        { name: 'Cafés', href: '/establishments?type=cafe', icon: Coffee },
        { name: 'Cloud Kitchens', href: '/establishments?type=cloud_kitchen', icon: Store }
    ]},
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Delivery Agents', href: '/delivery-agents', icon: Truck },
    { name: 'Orders', href: '/orders', icon: ShoppingBag },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings }
];

export const Sidebar: React.FC = () => {
    const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const location = useLocation();

    const toggleExpanded = (itemName: string) => {
        setExpandedItems(prev =>
            prev.includes(itemName)
                ? prev.filter(name => name !== itemName)
                : [...prev, itemName]
        );
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
        if (!isCollapsed) {
            setExpandedItems([]);
        }
    };

    // Function to check if a submenu item is active
    const isSubItemActive = (href: string) => {
        const url = new URL(href, window.location.origin);
        const currentPath = location.pathname;
        const currentSearch = location.search;

        // Check if paths match
        if (url.pathname !== currentPath) {
            return false;
        }

        // If the href has query parameters, check if they match
        if (url.search) {
            const urlParams = new URLSearchParams(url.search);
            const currentParams = new URLSearchParams(currentSearch);

            // Check if all URL params match current params
            for (const [key, value] of urlParams) {
                if (currentParams.get(key) !== value) {
                    return false;
                }
            }
            return true;
        }

        // If href has no query params, it's active only if current URL also has no relevant query params
        // For /establishments, it should be active only when there are no type filters
        if (currentPath === '/establishments') {
            return !currentSearch || !new URLSearchParams(currentSearch).has('type');
        }

        return true;
    };

    return (
        <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-surface shadow-swiggy border-r border-secondary-200 h-screen sticky top-0 flex flex-col transition-all duration-300`}>
            {/* Logo */}
            <div className="h-[73px] border-b border-secondary-200 flex items-center justify-between px-6">
                {!isCollapsed && (
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
                            <ChefHat className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-secondary-900">FoodEats</h2>
                            <p className="text-xs text-secondary-500">Admin Panel</p>
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
                            {item.subItems ? (
                                <div>
                                    <button
                                        onClick={() => !isCollapsed && toggleExpanded(item.name)}
                                        className="sidebar-item w-full justify-between"
                                        title={isCollapsed ? item.name : ''}
                                    >
                                        <div className="flex items-center">
                                            <item.icon className={`h-5 w-5 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
                                            {!isCollapsed && <span className="font-medium">{item.name}</span>}
                                        </div>
                                        {!isCollapsed && (
                                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedItems.includes(item.name) ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>
                                    {!isCollapsed && expandedItems.includes(item.name) && (
                                        <ul className="ml-6 mt-2 space-y-1">
                                            {item.subItems.map((subItem) => (
                                                <li key={subItem.name}>
                                                    <NavLink
                                                        to={subItem.href}
                                                        className={() =>
                                                            `sidebar-item text-sm ${isSubItemActive(subItem.href) ? 'sidebar-item-active' : ''}`
                                                        }
                                                    >
                                                        <subItem.icon className="mr-3 h-4 w-4" />
                                                        <span className="font-medium">{subItem.name}</span>
                                                    </NavLink>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                <NavLink
                                    to={item.href}
                                    className={({ isActive }) =>
                                        `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
                                    }
                                    title={isCollapsed ? item.name : ''}
                                >
                                    <item.icon className={`h-5 w-5 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
                                    {!isCollapsed && <span className="font-medium">{item.name}</span>}
                                </NavLink>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};
