import React from 'react';
import { Bell, User, LogOut, Power, PowerOff, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logoutUser, updateAvailabilityStatus } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

interface HeaderProps {
    title: string;
    actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, actions }) => {
    const { user } = useAuth();
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    const handleToggleAvailability = async (isAvailable: boolean) => {
        try {
            await authService.updateAvailabilityStatus(isAvailable);
            dispatch(updateAvailabilityStatus(isAvailable));
            toast.success(`You're now ${isAvailable ? 'online' : 'offline'}`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update availability');
        }
    };

    const isOnline = user?.deliveryAgentDetails?.isAvailable || false;

    return (
        <header className="bg-surface shadow-sm border-b border-secondary-200 sticky top-0 z-40">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <h1 className="text-xl font-semibold text-secondary-900">{title}</h1>

                        {/* Availability Status Toggle */}
                        <div className="flex items-center space-x-3 px-4 py-2 bg-secondary-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                                {isOnline ? (
                                    <Power className="h-4 w-4 text-success-600" />
                                ) : (
                                    <PowerOff className="h-4 w-4 text-error-600" />
                                )}
                                <span className="text-sm font-medium text-secondary-700">
                                    {isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            <Toggle
                                checked={isOnline}
                                onChange={handleToggleAvailability}
                                disabled={user?.status !== 'active'}
                            />
                        </div>

                        {/* Location Status */}
                        <div className="flex items-center space-x-2 text-sm text-secondary-600">
                            <MapPin className="h-4 w-4" />
                            <span>Location: Active</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {actions}

                        {/* Notifications */}
                        <Button variant="ghost" size="sm">
                            <Bell className="h-5 w-5" />
                        </Button>

                        {/* User Menu */}
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary-600" />
                                </div>
                                <div className="hidden md:block">
                                    <div className="text-sm font-medium text-secondary-900">
                                        {user?.name}
                                    </div>
                                    <div className="text-xs text-secondary-500">
                                        Rating: {user?.deliveryAgentDetails?.rating.toFixed(1) || '0.0'} ⭐
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                icon={<LogOut className="h-4 w-4" />}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
