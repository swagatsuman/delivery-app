import React from 'react';
import { Loading } from "./Loading.tsx";

interface Column {
    key: string;
    title: string;
    render?: (value: any, record: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

interface TableProps {
    columns: Column[];
    data: any[];
    loading?: boolean;
    emptyMessage?: string;
}

export const Table: React.FC<TableProps> = ({
                                                columns,
                                                data,
                                                loading = false,
                                                emptyMessage = 'No data available'
                                            }) => {
    if (loading) {
        return <Loading text="Loading data..." />;
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-secondary-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                <tr>
                    {columns.map((column) => (
                        <th
                            key={column.key}
                            className={`px-6 py-3 text-xs font-medium text-secondary-500 uppercase tracking-wider ${
                                column.align === 'center' ? 'text-center' :
                                    column.align === 'right' ? 'text-right' : 'text-left'
                            }`}
                            style={{ width: column.width }}
                        >
                            {column.title}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-secondary-200">
                {data.map((record, index) => (
                    <tr key={index} className="hover:bg-secondary-50 transition-colors">
                        {columns.map((column) => (
                            <td
                                key={column.key}
                                className={`px-6 py-4 whitespace-nowrap text-sm ${
                                    column.align === 'center' ? 'text-center' :
                                        column.align === 'right' ? 'text-right' : 'text-left'
                                }`}
                            >
                                {column.render ? column.render(record[column.key], record) : record[column.key]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};
