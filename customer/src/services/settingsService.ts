import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface DeliverySettings {
    deliveryFeePerOrder: number;
    deliveryRadius: number;
    agentCommissionPercentage: number;
    platformCommissionPercentage: number;
    restaurantCommissionPercentage: number;
    taxPercentage: number;
    minimumOrderValue: number;
    longDistanceThreshold: number;
    longDistanceDeliveryFee: number;
}

// Default settings in case Firestore fetch fails
const DEFAULT_SETTINGS: DeliverySettings = {
    deliveryFeePerOrder: 40,
    deliveryRadius: 10,
    agentCommissionPercentage: 80,
    platformCommissionPercentage: 20,
    restaurantCommissionPercentage: 15,
    taxPercentage: 5,
    minimumOrderValue: 199,
    longDistanceThreshold: 7,
    longDistanceDeliveryFee: 60
};

// Cache for delivery settings
let cachedSettings: DeliverySettings | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const settingsService = {
    /**
     * Get delivery settings from Firestore with caching
     */
    async getDeliverySettings(): Promise<DeliverySettings> {
        const now = Date.now();

        // Return cached settings if still valid
        if (cachedSettings && (now - lastFetchTime < CACHE_DURATION)) {
            return cachedSettings;
        }

        try {
            const settingsDoc = await getDoc(doc(db, 'settings', 'delivery'));

            if (settingsDoc.exists()) {
                const settings = settingsDoc.data() as DeliverySettings;
                cachedSettings = settings;
                lastFetchTime = now;
                return settings;
            }

            // If document doesn't exist, return defaults
            console.warn('Delivery settings not found in Firestore, using defaults');
            cachedSettings = DEFAULT_SETTINGS;
            lastFetchTime = now;
            return DEFAULT_SETTINGS;
        } catch (error) {
            console.error('Error fetching delivery settings:', error);
            // Return cached settings if available, otherwise defaults
            return cachedSettings || DEFAULT_SETTINGS;
        }
    },

    /**
     * Calculate delivery fee based on order total, distance, and settings
     */
    calculateDeliveryFee(
        orderTotal: number,
        distance: number,
        settings: DeliverySettings
    ): { customerFee: number; agentFee: number } {
        // If distance exceeds long distance threshold, apply long distance fee
        if (distance > settings.longDistanceThreshold) {
            const customerFee = settings.longDistanceDeliveryFee;
            const agentFee = customerFee * (settings.agentCommissionPercentage / 100);
            return { customerFee, agentFee };
        }

        // If order total meets minimum order value, free delivery for customer
        // But agent still gets their commission based on deliveryFeePerOrder
        if (orderTotal >= settings.minimumOrderValue) {
            return {
                customerFee: 0,
                agentFee: settings.deliveryFeePerOrder * (settings.agentCommissionPercentage / 100)
            };
        }

        // Regular delivery fee
        const customerFee = settings.deliveryFeePerOrder;
        const agentFee = customerFee * (settings.agentCommissionPercentage / 100);
        return { customerFee, agentFee };
    },

    /**
     * Clear cached settings (useful for testing or force refresh)
     */
    clearCache() {
        cachedSettings = null;
        lastFetchTime = 0;
    }
};
