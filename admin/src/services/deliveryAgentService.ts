import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User, UserFilters } from '../types';
import { USER_ROLES } from '../utils/constants';

export const deliveryAgentService = {
    async getDeliveryAgents(params?: {
        filters?: UserFilters;
        page?: number;
        limit?: number;
        lastDoc?: DocumentSnapshot;
    }) {
        try {
            const pageLimit = params?.limit || 20;
            const filters = params?.filters || { status: 'all', search: '', vehicleType: 'all' };

            let q;

            // Build query - avoid compound index by not using orderBy with multiple where clauses
            if (filters.status !== 'all') {
                q = query(
                    collection(db, 'users'),
                    where('role', '==', USER_ROLES.DELIVERY_AGENT),
                    where('status', '==', filters.status)
                );
            } else {
                q = query(
                    collection(db, 'users'),
                    where('role', '==', USER_ROLES.DELIVERY_AGENT)
                );
            }

            console.log('Executing delivery agent query with filters:', filters);
            const snapshot = await getDocs(q);
            console.log('Query results count:', snapshot.size);

            let deliveryAgentUsers = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    uid: doc.id,
                    createdAt: data.createdAt?.toDate() || new Date()
                } as User;
            });

            // Sort by createdAt client-side
            deliveryAgentUsers.sort((a, b) => {
                const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
                const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
                return dateB.getTime() - dateA.getTime();
            });

            // Apply pagination client-side
            const startIndex = params?.lastDoc ? deliveryAgentUsers.findIndex(u => u.uid === params.lastDoc.id) + 1 : 0;
            deliveryAgentUsers = deliveryAgentUsers.slice(startIndex, startIndex + pageLimit);

            // Fetch delivery agent details for each user
            const agentsWithDetails = await Promise.all(
                deliveryAgentUsers.map(async (user) => {
                    try {
                        const agentDoc = await getDoc(doc(db, 'deliveryAgents', user.uid));
                        if (agentDoc.exists()) {
                            const deliveryAgentDetails = agentDoc.data();
                            return { ...user, deliveryAgentDetails };
                        } else {
                            console.warn('No delivery agent details found for user:', user.uid);
                            return user;
                        }
                    } catch (error) {
                        console.warn(`Failed to fetch delivery agent details for user ${user.uid}:`, error);
                        return user;
                    }
                })
            );

            let agents = agentsWithDetails;

            // Apply client-side filters
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                agents = agents.filter(agent =>
                    agent.name.toLowerCase().includes(searchTerm) ||
                    agent.email.toLowerCase().includes(searchTerm) ||
                    (agent.phone && agent.phone.includes(searchTerm)) ||
                    (agent.deliveryAgentDetails?.vehicleNumber &&
                        agent.deliveryAgentDetails.vehicleNumber.toLowerCase().includes(searchTerm))
                );
            }

            // Apply vehicle type filter
            if (filters.vehicleType && filters.vehicleType !== 'all') {
                agents = agents.filter(agent =>
                    agent.deliveryAgentDetails?.vehicleType === filters.vehicleType
                );
            }

            console.log('Final filtered delivery agents:', agents.length);

            return {
                deliveryAgents: agents,
                total: agents.length,
                lastDoc: snapshot.docs[snapshot.docs.length - 1]
            };
        } catch (error: any) {
            console.error('Error in getDeliveryAgents:', error);
            throw new Error(error.message || 'Failed to fetch delivery agents');
        }
    },

    async getDeliveryAgentDetails(id: string) {
        try {
            // Fetch user data
            const userDoc = await getDoc(doc(db, 'users', id));
            if (!userDoc.exists()) {
                throw new Error('Delivery agent user not found');
            }

            const userData = userDoc.data() as User;
            if (userData.role !== USER_ROLES.DELIVERY_AGENT) {
                throw new Error('Invalid delivery agent ID');
            }

            // Fetch delivery agent details
            const agentDoc = await getDoc(doc(db, 'deliveryAgents', id));
            let deliveryAgentDetails = null;
            if (agentDoc.exists()) {
                deliveryAgentDetails = agentDoc.data();
            }

            return {
                ...userData,
                uid: userDoc.id,
                deliveryAgentDetails
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch delivery agent details');
        }
    },

    async updateDeliveryAgentStatus(uid: string, status: string) {
        try {
            console.log(`Updating delivery agent status: ${uid} -> ${status}`);

            // Update status in users collection
            await updateDoc(doc(db, 'users', uid), {
                status,
                updatedAt: new Date()
            });

            // Update isAvailable in deliveryAgents collection based on status
            const agentUpdates: any = { updatedAt: new Date() };

            if (status === 'active') {
                agentUpdates.isAvailable = true;
            } else if (status === 'suspended' || status === 'inactive') {
                agentUpdates.isAvailable = false;
                agentUpdates['workingHours.isOnline'] = false;
            }

            await updateDoc(doc(db, 'deliveryAgents', uid), agentUpdates);

            console.log('Delivery agent status updated successfully');
        } catch (error: any) {
            console.error('Error updating delivery agent status:', error);
            throw new Error(error.message || 'Failed to update delivery agent status');
        }
    },

    async getDeliveryAgentStats(uid: string) {
        try {
            // Fetch delivery agent details
            const agentDoc = await getDoc(doc(db, 'deliveryAgents', uid));
            if (agentDoc.exists()) {
                const agent = agentDoc.data();
                return {
                    totalDeliveries: agent.totalDeliveries || 0,
                    completedDeliveries: agent.completedDeliveries || 0,
                    cancelledDeliveries: agent.cancelledDeliveries || 0,
                    earnings: agent.earnings || 0,
                    rating: agent.averageRating || 0,
                    totalRatings: agent.totalRatings || 0
                };
            }

            return {
                totalDeliveries: 0,
                completedDeliveries: 0,
                cancelledDeliveries: 0,
                earnings: 0,
                rating: 0,
                totalRatings: 0
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch delivery agent stats');
        }
    }
};
