import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, User } from 'lucide-react';

interface MobileLayoutProps {
    children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const bottomNavItems = [
        {
            id: 'home',
            label: 'Home',
            icon: Home,
            path: '/home',
            isActive: location.pathname === '/home'
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: Package,
            path: '/orders',
            isActive: location.pathname === '/orders' || location.pathname.startsWith('/orders/')
        },
        {
            id: 'profile',
            label: 'Profile',
            icon: User,
            path: '/profile',
            isActive: location.pathname === '/profile'
        }
    ];

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-16">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-secondary-200 z-50 safe-area-bottom">
                <div className="flex items-center justify-around h-16 px-2">
                    {bottomNavItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 relative transition-colors ${
                                item.isActive
                                    ? 'text-primary-600'
                                    : 'text-secondary-500 hover:text-secondary-700'
                            }`}
                        >
                            <div className="relative">
                                <item.icon className="h-6 w-6" />
                            </div>
                            <span className="text-xs mt-1 font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};
