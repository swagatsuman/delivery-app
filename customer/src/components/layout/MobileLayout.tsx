import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppDispatch';

interface MobileLayoutProps {
    children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { items } = useAppSelector(state => state.cart);

    const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

    const bottomNavItems = [
        {
            id: 'home',
            label: 'Home',
            icon: Home,
            path: '/home',
            isActive: location.pathname === '/home'
        },
        {
            id: 'search',
            label: 'Search',
            icon: Search,
            path: '/search',
            isActive: location.pathname === '/search'
        },
        {
            id: 'cart',
            label: 'Cart',
            icon: ShoppingCart,
            path: '/cart',
            isActive: location.pathname === '/cart',
            badge: cartItemCount > 0 ? cartItemCount : undefined
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
            <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-secondary-200 z-50">
                <div className="flex items-center justify-around h-16 px-2">
                    {bottomNavItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 relative ${
                                item.isActive
                                    ? 'text-primary-600'
                                    : 'text-secondary-500 hover:text-secondary-700'
                            }`}
                        >
                            <div className="relative">
                                <item.icon className="h-6 w-6" />
                                {item.badge && (
                                    <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                                )}
                            </div>
                            <span className="text-xs mt-1 font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};
