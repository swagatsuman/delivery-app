import React from 'react';
import { Card } from '../../ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ChartsProps {
    data: any[];
    loading: boolean;
}

export const Charts: React.FC<ChartsProps> = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="animate-pulse">
                    <div className="h-80 bg-secondary-200 rounded"></div>
                </Card>
                <Card className="animate-pulse">
                    <div className="h-80 bg-secondary-200 rounded"></div>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Orders Trend" padding="md">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="orders"
                            stroke="#f97316"
                            strokeWidth={2}
                            dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#f97316', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            <Card title="Revenue Analysis" padding="md">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value) => [`₹${value}`, 'Revenue']}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};
