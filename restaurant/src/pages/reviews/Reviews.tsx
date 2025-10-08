import React, { useEffect, useState } from 'react';
import { Star, TrendingUp, Users, ThumbsUp, MessageSquare } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Review {
    id: string;
    orderNumber: string;
    customerName: string;
    foodRating: number;
    foodReview?: string;
    createdAt: Date;
}

const Reviews: React.FC = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        fiveStarCount: 0,
        fourStarCount: 0,
        threeStarCount: 0,
        twoStarCount: 0,
        oneStarCount: 0
    });

    useEffect(() => {
        fetchReviews();
    }, [user]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            // Use establishmentDetails.id or user.uid (they're the same)
            const restaurantId = user?.establishmentDetails?.id || user?.uid;

            console.log('Fetching reviews for restaurant:', restaurantId);
            console.log('User object:', user);

            if (!restaurantId) {
                console.error('No restaurant ID found');
                console.error('User data:', { uid: user?.uid, hasEstablishmentDetails: !!user?.establishmentDetails });
                return;
            }

            // Try query with ordering first
            let snapshot;
            try {
                const ratingsQuery = query(
                    collection(db, 'ratings'),
                    where('restaurantId', '==', restaurantId),
                    orderBy('createdAt', 'desc')
                );

                console.log('Executing ratings query with orderBy...');
                snapshot = await getDocs(ratingsQuery);
                console.log('Found ratings (with orderBy):', snapshot.size);
            } catch (indexError: any) {
                // If index error, fall back to simple query
                if (indexError.code === 'failed-precondition') {
                    console.warn('Index not found, using simple query without orderBy');
                    const simpleQuery = query(
                        collection(db, 'ratings'),
                        where('restaurantId', '==', restaurantId)
                    );

                    snapshot = await getDocs(simpleQuery);
                    console.log('Found ratings (simple query):', snapshot.size);
                } else {
                    throw indexError;
                }
            }

            const reviewsData: Review[] = [];
            let totalRating = 0;
            let ratingCounts = {
                5: 0,
                4: 0,
                3: 0,
                2: 0,
                1: 0
            };

            snapshot.forEach((doc) => {
                const data = doc.data();
                console.log('Rating data:', data);

                reviewsData.push({
                    id: doc.id,
                    orderNumber: data.orderNumber || doc.id.slice(0, 8),
                    customerName: data.customerName || 'Anonymous',
                    foodRating: data.foodRating,
                    foodReview: data.foodReview,
                    createdAt: data.createdAt?.toDate() || new Date()
                });

                totalRating += data.foodRating;
                ratingCounts[data.foodRating as keyof typeof ratingCounts]++;
            });

            console.log('Processed reviews:', reviewsData.length);

            setReviews(reviewsData);
            setStats({
                averageRating: reviewsData.length > 0 ? totalRating / reviewsData.length : 0,
                totalReviews: reviewsData.length,
                fiveStarCount: ratingCounts[5],
                fourStarCount: ratingCounts[4],
                threeStarCount: ratingCounts[3],
                twoStarCount: ratingCounts[2],
                oneStarCount: ratingCounts[1]
            });
        } catch (error: any) {
            console.error('Error fetching reviews:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            // If it's a missing index error, show helpful message
            if (error.code === 'failed-precondition' || error.message?.includes('index')) {
                console.error('Firestore index required. Check console for the index creation link.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'text-success-600 bg-success-50';
        if (rating >= 3.5) return 'text-primary-600 bg-primary-50';
        if (rating >= 2.5) return 'text-warning-600 bg-warning-50';
        return 'text-error-600 bg-error-50';
    };

    const getRatingPercentage = (count: number) => {
        return stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    return (
        <Layout title="Reviews & Ratings">
            <div className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-secondary-600">Average Rating</p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <p className={`text-3xl font-bold ${getRatingColor(stats.averageRating).split(' ')[0]}`}>
                                        {stats.averageRating.toFixed(1)}
                                    </p>
                                    <Star className={`h-6 w-6 ${getRatingColor(stats.averageRating).split(' ')[0]} fill-current`} />
                                </div>
                            </div>
                            <div className={`p-3 rounded-full ${getRatingColor(stats.averageRating).split(' ')[1]}`}>
                                <TrendingUp className={`h-6 w-6 ${getRatingColor(stats.averageRating).split(' ')[0]}`} />
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-secondary-600">Total Reviews</p>
                                <p className="text-3xl font-bold text-secondary-900 mt-1">{stats.totalReviews}</p>
                            </div>
                            <div className="p-3 bg-primary-50 rounded-full">
                                <MessageSquare className="h-6 w-6 text-primary-600" />
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-secondary-600">5 Star Reviews</p>
                                <p className="text-3xl font-bold text-success-600 mt-1">{stats.fiveStarCount}</p>
                            </div>
                            <div className="p-3 bg-success-50 rounded-full">
                                <ThumbsUp className="h-6 w-6 text-success-600" />
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-secondary-600">Customers</p>
                                <p className="text-3xl font-bold text-secondary-900 mt-1">{stats.totalReviews}</p>
                            </div>
                            <div className="p-3 bg-secondary-100 rounded-full">
                                <Users className="h-6 w-6 text-secondary-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Rating Distribution */}
                <Card padding="lg">
                    <h2 className="text-lg font-semibold text-secondary-900 mb-4">Rating Distribution</h2>
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = stats[`${['five', 'four', 'three', 'two', 'one'][5 - rating]}StarCount` as keyof typeof stats] as number;
                            const percentage = getRatingPercentage(count);

                            return (
                                <div key={rating} className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-1 w-16">
                                        <span className="text-sm font-medium text-secondary-900">{rating}</span>
                                        <Star className="h-4 w-4 text-warning-500 fill-current" />
                                    </div>
                                    <div className="flex-1 bg-secondary-100 rounded-full h-2">
                                        <div
                                            className="bg-warning-500 h-2 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-secondary-600 w-12 text-right">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Reviews List */}
                <Card padding="lg">
                    <h2 className="text-lg font-semibold text-secondary-900 mb-4">Customer Reviews</h2>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                            <p className="text-secondary-600 mt-4">Loading reviews...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-secondary-900 mb-2">No Reviews Yet</h3>
                            <p className="text-secondary-600">
                                Customer reviews will appear here once they rate their orders
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-b border-secondary-200 last:border-0 pb-4 last:pb-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="font-medium text-secondary-900">{review.customerName}</h4>
                                            <p className="text-xs text-secondary-500">Order #{review.orderNumber}</p>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-sm font-semibold text-secondary-900">{review.foodRating}</span>
                                            <Star className="h-4 w-4 text-warning-500 fill-current" />
                                        </div>
                                    </div>
                                    {review.foodReview && (
                                        <p className="text-sm text-secondary-700 mb-2">{review.foodReview}</p>
                                    )}
                                    <p className="text-xs text-secondary-500">{formatDate(review.createdAt)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </Layout>
    );
};

export default Reviews;
