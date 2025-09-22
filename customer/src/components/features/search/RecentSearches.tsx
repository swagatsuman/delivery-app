import React from 'react';
import { Clock, X } from 'lucide-react';

interface RecentSearchesProps {
    searches: string[];
    onSearchClick: (search: string) => void;
    onRemoveSearch: (search: string) => void;
    onClearAll: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
                                                                  searches,
                                                                  onSearchClick,
                                                                  onRemoveSearch,
                                                                  onClearAll
                                                              }) => {
    if (searches.length === 0) {
        return null;
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-secondary-900">
                    Recent Searches
                </h2>
                <button
                    onClick={onClearAll}
                    className="text-sm text-primary-600 hover:text-primary-700"
                >
                    Clear All
                </button>
            </div>

            <div className="space-y-2">
                {searches.map((search, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 hover:bg-secondary-50 rounded-lg group"
                    >
                        <button
                            onClick={() => onSearchClick(search)}
                            className="flex items-center space-x-3 flex-1 text-left"
                        >
                            <Clock className="h-4 w-4 text-secondary-400" />
                            <span className="text-secondary-700">{search}</span>
                        </button>
                        <button
                            onClick={() => onRemoveSearch(search)}
                            className="p-1 text-secondary-400 hover:text-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
