import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    onClick: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center space-x-3 p-4 bg-surface border border-secondary-200 rounded-xl shadow-sm"
        >
            <Search className="h-5 w-5 text-secondary-400" />
            <span className="text-secondary-500">Search for restaurants, cuisines, dishes...</span>
        </button>
    );
};
