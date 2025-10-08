import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { TopHeader } from '../../components/layout/TopHeader';
import { Button } from '../../components/ui/Button';
import { RatingStars } from '../../components/common/RatingStars';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { fetchOrderDetails, rateOrder } from '../../store/slices/orderSlice';
import { Loading } from '../../components/ui/Loading';

const OrderRating: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentOrder, loading } = useAppSelector(state => state.order);

    const [foodRating, setFoodRating] = useState(0);
    const [foodReview, setFoodReview] = useState('');
    const [deliveryRating, setDeliveryRating] = useState(0);
    const [deliveryReview, setDeliveryReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchOrderDetails(id));
        }
    }, [id, dispatch]);

    if (loading || !currentOrder) {
        return <Loading fullScreen />;
    }

    const handleSubmitRating = async () => {
        if (foodRating === 0 || deliveryRating === 0) {
            alert('Please provide ratings for both food and delivery');
            return;
        }

        setIsSubmitting(true);
        try {
            await dispatch(rateOrder({
                orderId: currentOrder.id,
                rating: {
                    foodRating,
                    foodReview: foodReview.trim() || undefined,
                    deliveryRating,
                    deliveryReview: deliveryReview.trim() || undefined,
                    createdAt: new Date()
                }
            }));

            navigate('/orders');
        } catch (error) {
            console.error('Failed to submit rating:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <TopHeader title="Rate Your Order" />

            <div className="p-4 space-y-6">
                {/* Order Info */}
                <div className="bg-surface rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                        {currentOrder.restaurant?.images?.[0] && (
                            <img
                                src={currentOrder.restaurant.images[0]}
                                alt={currentOrder.restaurant?.name || 'Restaurant'}
                                className="w-12 h-12 rounded-lg object-cover"
                            />
                        )}
                        <div>
                            <h3 className="font-semibold text-secondary-900">
                                {currentOrder.restaurant?.name || (currentOrder as any).restaurantName || 'Restaurant'}
                            </h3>
                            <p className="text-sm text-secondary-600">
                                Order #{currentOrder.orderNumber}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Food Rating */}
                <div className="bg-surface rounded-xl p-4">
                    <h3 className="font-semibold text-secondary-900 mb-4">How was the food?</h3>

                    <div className="text-center mb-4">
                        <RatingStars
                            rating={foodRating}
                            interactive
                            onRatingChange={setFoodRating}
                            size="lg"
                        />
                        <p className="text-sm text-secondary-600 mt-2">
                            {foodRating === 0 ? 'Tap to rate' :
                                foodRating === 1 ? 'Poor' :
                                    foodRating === 2 ? 'Fair' :
                                        foodRating === 3 ? 'Good' :
                                            foodRating === 4 ? 'Very Good' : 'Excellent'}
                        </p>
                    </div>

                    <textarea
                        value={foodReview}
                        onChange={(e) => setFoodReview(e.target.value)}
                        placeholder="Share your feedback about the food quality, taste, etc."
                        className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        rows={3}
                        maxLength={500}
                    />
                    <p className="text-xs text-secondary-500 mt-1">
                        {foodReview.length}/500 characters
                    </p>
                </div>

                {/* Delivery Rating */}
                <div className="bg-surface rounded-xl p-4">
                    <h3 className="font-semibold text-secondary-900 mb-4">How was the delivery?</h3>

                    <div className="text-center mb-4">
                        <RatingStars
                            rating={deliveryRating}
                            interactive
                            onRatingChange={setDeliveryRating}
                            size="lg"
                        />
                        <p className="text-sm text-secondary-600 mt-2">
                            {deliveryRating === 0 ? 'Tap to rate' :
                                deliveryRating === 1 ? 'Poor' :
                                    deliveryRating === 2 ? 'Fair' :
                                        deliveryRating === 3 ? 'Good' :
                                            deliveryRating === 4 ? 'Very Good' : 'Excellent'}
                        </p>
                    </div>

                    <textarea
                        value={deliveryReview}
                        onChange={(e) => setDeliveryReview(e.target.value)}
                        placeholder="Share your feedback about delivery time, packaging, etc."
                        className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        rows={3}
                        maxLength={500}
                    />
                    <p className="text-xs text-secondary-500 mt-1">
                        {deliveryReview.length}/500 characters
                    </p>
                </div>

                {/* Submit Button */}
                <Button
                    onClick={handleSubmitRating}
                    className="w-full h-12"
                    loading={isSubmitting}
                    disabled={foodRating === 0 || deliveryRating === 0 || isSubmitting}
                >
                    Submit Rating
                </Button>

                <p className="text-xs text-center text-secondary-500">
                    Your feedback helps us improve our service and helps other customers make better choices
                </p>
            </div>
        </div>
    );
};

export default OrderRating;
