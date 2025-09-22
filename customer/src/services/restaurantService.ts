import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    GeoPoint
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Restaurant, Category, MenuCategory, Coordinates, SearchResults } from '../types';

class RestaurantService {

    async getNearbyRestaurants(coordinates: Coordinates, radiusKm: number = 10): Promise<Restaurant[]> {
        try {
            // For now, get all restaurants and filter by distance client-side
            // In production, you'd use Firebase Extensions for geoqueries
            const restaurantsRef = collection(db, 'restaurants');
            const q = query(restaurantsRef, where('isActive', '==', true));
            const snapshot = await getDocs(q);

            const restaurants: Restaurant[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();

                // Convert Firestore data to Restaurant type
                const restaurant: Restaurant = {
                    id: doc.id,
                    name: data.name,
                    description: data.description,
                    images: data.images || [],
                    cuisineTypes: data.cuisineTypes || [],
                    rating: data.rating || 0,
                    totalRatings: data.totalRatings || 0,
                    deliveryTime: data.deliveryTime || '30-40 mins',
                    deliveryFee: data.deliveryFee || 30,
                    minimumOrder: data.minimumOrder || 0,
                    address: {
                        id: data.address?.id || doc.id,
                        userId: data.ownerId,
                        label: 'Restaurant',
                        address: data.address?.street || data.address?.address || '',
                        city: data.address?.city || '',
                        state: data.address?.state || '',
                        pincode: data.address?.pincode || '',
                        coordinates: data.address?.coordinates ? {
                            lat: data.address.coordinates.latitude || data.address.coordinates.lat,
                            lng: data.address.coordinates.longitude || data.address.coordinates.lng
                        } : { lat: 0, lng: 0 },
                        isDefault: false,
                        createdAt: data.createdAt?.toDate() || new Date(),
                        updatedAt: data.updatedAt?.toDate() || new Date()
                    },
                    isOpen: this.isRestaurantOpen(data.operatingHours),
                    distance: this.calculateDistance(coordinates, {
                        lat: data.address?.coordinates?.latitude || data.address?.coordinates?.lat || 0,
                        lng: data.address?.coordinates?.longitude || data.address?.coordinates?.lng || 0
                    }),
                    offers: data.offers || [],
                    featured: data.featured || false
                };

                // Only include restaurants within radius
                if (restaurant.distance && restaurant.distance <= radiusKm) {
                    restaurants.push(restaurant);
                }
            });

            // Sort by distance
            return restaurants.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        } catch (error) {
            console.error('Error fetching nearby restaurants:', error);
            throw new Error('Failed to fetch restaurants');
        }
    }

    async getCategories(): Promise<Category[]> {
        try {
            const categoriesRef = collection(db, 'categories');
            const snapshot = await getDocs(categoriesRef);

            const categories: Category[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                categories.push({
                    id: doc.id,
                    name: data.name,
                    image: data.image,
                    restaurantCount: data.restaurantCount || 0
                });
            });

            return categories;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw new Error('Failed to fetch categories');
        }
    }

    async getRestaurantDetails(restaurantId: string): Promise<Restaurant> {
        try {
            const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantId));

            if (!restaurantDoc.exists()) {
                throw new Error('Restaurant not found');
            }

            const data = restaurantDoc.data();

            return {
                id: restaurantDoc.id,
                name: data.name,
                description: data.description,
                images: data.images || [],
                cuisineTypes: data.cuisineTypes || [],
                rating: data.rating || 0,
                totalRatings: data.totalRatings || 0,
                deliveryTime: data.deliveryTime || '30-40 mins',
                deliveryFee: data.deliveryFee || 30,
                minimumOrder: data.minimumOrder || 0,
                address: {
                    id: data.address?.id || restaurantDoc.id,
                    userId: data.ownerId,
                    label: 'Restaurant',
                    address: data.address?.street || data.address?.address || '',
                    city: data.address?.city || '',
                    state: data.address?.state || '',
                    pincode: data.address?.pincode || '',
                    coordinates: data.address?.coordinates ? {
                        lat: data.address.coordinates.latitude || data.address.coordinates.lat,
                        lng: data.address.coordinates.longitude || data.address.coordinates.lng
                    } : { lat: 0, lng: 0 },
                    isDefault: false,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                },
                isOpen: this.isRestaurantOpen(data.operatingHours),
                offers: data.offers || [],
                featured: data.featured || false
            };
        } catch (error) {
            console.error('Error fetching restaurant details:', error);
            throw new Error('Failed to fetch restaurant details');
        }
    }

    async getRestaurantMenu(restaurantId: string): Promise<MenuCategory[]> {
        try {
            // Get menu categories
            const categoriesRef = collection(db, 'restaurants', restaurantId, 'menuCategories');
            const categoriesSnapshot = await getDocs(categoriesRef);

            const menuCategories: MenuCategory[] = [];

            for (const categoryDoc of categoriesSnapshot.docs) {
                const categoryData = categoryDoc.data();

                // Get menu items for this category
                const itemsRef = collection(db, 'restaurants', restaurantId, 'menuItems');
                const itemsQuery = query(itemsRef, where('categoryId', '==', categoryDoc.id));
                const itemsSnapshot = await getDocs(itemsQuery);

                const items = itemsSnapshot.docs.map(itemDoc => {
                    const itemData = itemDoc.data();
                    return {
                        id: itemDoc.id,
                        restaurantId,
                        categoryId: categoryDoc.id,
                        name: itemData.name,
                        description: itemData.description,
                        images: itemData.images || [],
                        price: itemData.price,
                        discountPrice: itemData.discountPrice,
                        type: itemData.type,
                        spiceLevel: itemData.spiceLevel || 'mild',
                        isRecommended: itemData.isRecommended || false,
                        isAvailable: itemData.isAvailable !== false,
                        rating: itemData.rating || 0,
                        totalRatings: itemData.totalRatings || 0,
                        customizations: itemData.customizations || []
                    };
                });

                menuCategories.push({
                    id: categoryDoc.id,
                    name: categoryData.name,
                    items
                });
            }

            return menuCategories;
        } catch (error) {
            console.error('Error fetching restaurant menu:', error);
            throw new Error('Failed to fetch restaurant menu');
        }
    }

    async searchAll(searchQuery: string): Promise<SearchResults> {
        try {
            const query = searchQuery.toLowerCase();

            // Search restaurants
            const restaurantsRef = collection(db, 'restaurants');
            const restaurantsSnapshot = await getDocs(restaurantsRef);

            const restaurants: Restaurant[] = [];
            const dishes: any[] = [];

            for (const restaurantDoc of restaurantsSnapshot.docs) {
                const restaurantData = restaurantDoc.data();

                // Check if restaurant matches search
                if (
                    restaurantData.name?.toLowerCase().includes(query) ||
                    restaurantData.cuisineTypes?.some((cuisine: string) => cuisine.toLowerCase().includes(query))
                ) {
                    const restaurant = await this.getRestaurantDetails(restaurantDoc.id);
                    restaurants.push(restaurant);
                }

                // Search menu items
                const itemsRef = collection(db, 'restaurants', restaurantDoc.id, 'menuItems');
                const itemsSnapshot = await getDocs(itemsRef);

                itemsSnapshot.docs.forEach(itemDoc => {
                    const itemData = itemDoc.data();
                    if (
                        itemData.name?.toLowerCase().includes(query) ||
                        itemData.description?.toLowerCase().includes(query)
                    ) {
                        dishes.push({
                            id: itemDoc.id,
                            restaurantId: restaurantDoc.id,
                            categoryId: itemData.categoryId,
                            name: itemData.name,
                            description: itemData.description,
                            images: itemData.images || [],
                            price: itemData.price,
                            discountPrice: itemData.discountPrice,
                            type: itemData.type,
                            spiceLevel: itemData.spiceLevel || 'mild',
                            isRecommended: itemData.isRecommended || false,
                            isAvailable: itemData.isAvailable !== false,
                            rating: itemData.rating || 0,
                            totalRatings: itemData.totalRatings || 0
                        });
                    }
                });
            }

            return {
                restaurants,
                dishes,
                categories: []
            };
        } catch (error) {
            console.error('Error searching:', error);
            throw new Error('Search failed');
        }
    }

    private calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
        const R = 6371; // Radius of the Earth in km
        const dLat = this.deg2rad(coord2.lat - coord1.lat);
        const dLon = this.deg2rad(coord2.lng - coord1.lng);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(coord1.lat)) * Math.cos(this.deg2rad(coord2.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return Math.round(d * 10) / 10; // Round to 1 decimal place
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    private isRestaurantOpen(operatingHours?: any): boolean {
        return operatingHours.isOpen;
        // if (!operatingHours) return true;
        //
        // const now = new Date();
        // const currentTime = now.getHours() * 60 + now.getMinutes();
        // const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        //
        // const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        // const todayHours = operatingHours[dayNames[dayOfWeek]];
        //
        // if (!todayHours || !todayHours.isOpen) return false;
        //
        // const openTime = this.timeStringToMinutes(todayHours.openTime);
        // const closeTime = this.timeStringToMinutes(todayHours.closeTime);
        //
        // if (closeTime > openTime) {
        //     // Same day
        //     return currentTime >= openTime && currentTime <= closeTime;
        // } else {
        //     // Crosses midnight
        //     return currentTime >= openTime || currentTime <= closeTime;
        // }
    }

    private timeStringToMinutes(timeString: string): number {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }
}

export const restaurantService = new RestaurantService();
