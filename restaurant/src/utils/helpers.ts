import { format, formatDistanceToNow, isToday, isYesterday, isValid } from 'date-fns';

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};

export const formatNumber = (num: number): string => {
    if (num >= 10000000) {
        return (num / 10000000).toFixed(1) + 'Cr';
    } else if (num >= 100000) {
        return (num / 100000).toFixed(1) + 'L';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

export const formatDate = (date: Date | string | any): string => {
    try {
        let dateObj: Date;

        if (date && typeof date === 'object' && date.toDate) {
            dateObj = date.toDate();
        } else if (typeof date === 'string') {
            dateObj = new Date(date);
        } else if (date instanceof Date) {
            dateObj = date;
        } else {
            return 'Invalid date';
        }

        if (!isValid(dateObj)) {
            return 'Invalid date';
        }

        if (isToday(dateObj)) {
            return `Today ${format(dateObj, 'HH:mm')}`;
        } else if (isYesterday(dateObj)) {
            return `Yesterday ${format(dateObj, 'HH:mm')}`;
        } else {
            return format(dateObj, 'MMM dd, yyyy HH:mm');
        }
    } catch (error) {
        return 'Invalid date';
    }
};

export const formatRelativeTime = (date: Date | string | any): string => {
    try {
        let dateObj: Date;

        if (date && typeof date === 'object' && date.toDate) {
            dateObj = date.toDate();
        } else if (typeof date === 'string') {
            dateObj = new Date(date);
        } else if (date instanceof Date) {
            dateObj = date;
        } else {
            return 'Unknown time';
        }

        if (!isValid(dateObj)) {
            return 'Unknown time';
        }

        return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
        return 'Unknown time';
    }
};

export const getOrderStatusColor = (status: string): string => {
    const colors = {
        placed: 'bg-blue-100 text-blue-800',
        confirmed: 'bg-green-100 text-green-800',
        preparing: 'bg-yellow-100 text-yellow-800',
        ready: 'bg-purple-100 text-purple-800',
        picked_up: 'bg-indigo-100 text-indigo-800',
        on_the_way: 'bg-orange-100 text-orange-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-secondary-100 text-secondary-800';
};

export const getFoodTypeColor = (type: string): string => {
    const colors = {
        veg: 'bg-green-100 text-green-800',
        'non-veg': 'bg-red-100 text-red-800',
        egg: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type as keyof typeof colors] || 'bg-secondary-100 text-secondary-800';
};

export const getSpiceLevelColor = (level: string): string => {
    const colors = {
        mild: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        hot: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-secondary-100 text-secondary-800';
};

export const calculatePreparationTime = (items: any[]): number => {
    return Math.max(...items.map(item => item.preparationTime || 15));
};

export const generateOrderNumber = (): string => {
    return `ORD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

export const validateGSTIN = (gstin: string): boolean => {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
};

export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), wait);
    };
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
};

export const toDate = (dateInput: any): Date | null => {
    try {
        if (!dateInput) return null;

        if (dateInput && typeof dateInput === 'object' && dateInput.toDate) {
            return dateInput.toDate();
        }

        if (typeof dateInput === 'string') {
            const date = new Date(dateInput);
            return isValid(date) ? date : null;
        }

        if (dateInput instanceof Date) {
            return isValid(dateInput) ? dateInput : null;
        }

        return null;
    } catch (error) {
        return null;
    }
};

export const createTimestamp = (): Date => {
    return new Date();
};
