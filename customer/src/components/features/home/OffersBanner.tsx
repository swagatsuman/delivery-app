import React from 'react';
import { Gift } from 'lucide-react';

export const OffersBanner: React.FC = () => {
    const offers = [
        {
            id: '1',
            title: '50% OFF up to ₹100',
            subtitle: 'Use code WELCOME50',
            color: 'bg-gradient-to-r from-pink-500 to-purple-600'
        },
        {
            id: '2',
            title: 'Free Delivery',
            subtitle: 'On orders above ₹299',
            color: 'bg-gradient-to-r from-green-500 to-blue-600'
        },
        {
            id: '3',
            title: '₹150 OFF',
            subtitle: 'Use code SAVE150',
            color: 'bg-gradient-to-r from-orange-500 to-red-600'
        }
    ];

    return (
        <div className="space-y-3">
            <div className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-secondary-900">
                    Offers for you
                </h2>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-2">
                {offers.map((offer) => (
                    <div
                        key={offer.id}
                        className={`${offer.color} text-white p-4 rounded-xl min-w-[280px] shadow-lg`}
                    >
                        <h3 className="font-bold text-lg mb-1">{offer.title}</h3>
                        <p className="text-sm opacity-90">{offer.subtitle}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
