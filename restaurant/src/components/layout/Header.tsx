import React from 'react';
import { Bell, User, LogOut, Power, PowerOff } from 'lucide-react';
import { Icon } from '../ui/Icon';
import { Toggle } from '../ui/Toggle';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logoutUser, updateEstablishmentStatus } from '../../store/slices/authSlice';
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

    const handleToggleStatus = async (isOpen: boolean) => {
        try {
            await authService.updateEstablishmentStatus(isOpen);
            dispatch(updateEstablishmentStatus(isOpen));
            toast.success(`Establishment ${isOpen ? 'opened' : 'closed'} successfully`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update establishment status');
        }
    };

    const isOpen = user?.establishmentDetails?.operatingHours.isOpen || false;

    return (
        <header className="bg-surface shadow-sm border-b border-secondary-200 sticky top-0 z-40">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <h1 className="text-xl font-semibold text-secondary-900">{title}</h1>

                        {/* Establishment Status Toggle */}
                        <div className="flex items-center space-x-3 px-4 py-2 bg-secondary-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                                {isOpen ? (
                                    <Power className="h-4 w-4 text-success-600" />
                                ) : (
                                    <PowerOff className="h-4 w-4 text-error-600" />
                                )}
                                <span className="text-sm font-medium text-secondary-700">
                  {isOpen ? 'Open' : 'Closed'}
                </span>
                            </div>
                            <Toggle
                                checked={isOpen}
                                onChange={handleToggleStatus}
                                disabled={user?.status !== 'active'}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {actions}

                        {/* Notifications */}
                        <Icon variant="ghost" size="md" icon={<Bell className="h-5 w-5" />} />

                        {/* User Menu */}
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary-600" />
                                </div>
                                <div className="hidden md:block">
                                    <div className="text-sm font-medium text-secondary-900">
                                        {user?.establishmentDetails?.businessName || user?.name}
                                    </div>
                                    <div className="text-xs text-secondary-500">{user?.email}</div>
                                </div>
                            </div>

                            <Icon
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
