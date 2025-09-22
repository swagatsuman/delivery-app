import React from 'react';
import {
    User,
    MapPin,
    Heart,
    CreditCard,
    HelpCircle,
    Settings,
    LogOut,
    ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { logoutUser } from '../../../store/slices/authSlice';

interface ProfileMenuProps {
    user: any;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ user }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const menuItems = [
        {
            icon: MapPin,
            label: 'Manage Addresses',
            path: '/addresses',
            description: 'Add, edit or delete addresses'
        },
        {
            icon: Heart,
            label: 'Favorites',
            path: '/favorites',
            description: 'Your favorite restaurants and dishes'
        },
        {
            icon: CreditCard,
            label: 'Payment Methods',
            path: '/payment-methods',
            description: 'Manage your payment options'
        },
        {
            icon: HelpCircle,
            label: 'Help & Support',
            path: '/help',
            description: 'Get help or contact support'
        },
        {
            icon: Settings,
            label: 'Settings',
            path: '/settings',
            description: 'App preferences and notifications'
        }
    ];

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/login');
    };

    return (
        <div className="space-y-6">
            {/* User Info */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-xl">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{user?.name}</h2>
                        <p className="text-primary-100">{user?.phone}</p>
                        {user?.email && (
                            <p className="text-primary-100 text-sm">{user.email}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className="w-full flex items-center justify-between p-4 bg-surface rounded-lg hover:bg-secondary-50 transition-colors"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                <item.icon className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-medium text-secondary-900">{item.label}</h3>
                                <p className="text-sm text-secondary-600">{item.description}</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-secondary-400" />
                    </button>
                ))}
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 p-4 text-error-600 border border-error-200 rounded-lg hover:bg-error-50 transition-colors"
            >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
            </button>

            {/* App Info */}
            <div className="text-center text-sm text-secondary-500 pt-4">
                <p>Version 1.0.0</p>
                <p className="mt-1">Made with ❤️ by FoodEats Team</p>
            </div>
        </div>
    );
};
