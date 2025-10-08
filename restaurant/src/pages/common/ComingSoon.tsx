import React from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Construction, Clock } from 'lucide-react';

interface ComingSoonProps {
    title?: string;
    description?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
    title = 'Coming Soon',
    description = 'This feature is currently under development and will be available soon.'
}) => {
    return (
        <Layout title={title}>
            <div className="p-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
                <Card className="max-w-2xl w-full">
                    <div className="p-12 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="p-6 bg-primary-100 rounded-full">
                                    <Construction className="h-16 w-16 text-primary-600" />
                                </div>
                                <div className="absolute -top-2 -right-2 p-2 bg-warning-100 rounded-full">
                                    <Clock className="h-6 w-6 text-warning-600" />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
                            {title}
                        </h1>

                        <p className="text-lg text-secondary-600 mb-8">
                            {description}
                        </p>

                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                            <p className="text-sm text-primary-700">
                                We're working hard to bring you this feature. Stay tuned for updates!
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default ComingSoon;
