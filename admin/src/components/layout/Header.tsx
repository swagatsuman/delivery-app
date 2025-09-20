import React from 'react';
import { Bell, User, LogOut, Search } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logoutUser } from '../../store/slices/authSlice';

interface HeaderProps {
    title: string;
    actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({title, actions}) => {
    const {user} = useAuth();
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    return (
        <header className="bg-surface shadow-sm border-b border-secondary-200 sticky top-0 z-40">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-semibold text-secondary-900">{title}</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        {actions}

                        {/* Search */}
                        <div className="relative hidden md:block">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4"/>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 w-64 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                            />
                        </div>

                        {/* Notifications */}
                        <Button variant="ghost" size="sm">
                            <Bell className="h-5 w-5"/>
                        </Button>

                        {/* User Menu */}
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary-600"/>
                                </div>
                                <div className="hidden md:block">
                                    <div className="text-sm font-medium text-secondary-900">{user?.name}</div>
                                    <div className="text-xs text-secondary-500 capitalize">{user?.role}</div>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                icon={<LogOut className="h-4 w-4"/>}
                                children={undefined}/>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
