import React from 'react';

interface HistoryProps {
    items: string[];
    onSearch: (query: string) => void;
    onClear: () => void;
}

const ClearIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);


export const History: React.FC<HistoryProps> = ({ items, onSearch, onClear }) => {
    if (items.length === 0) return null;

    return (
        <div className="max-w-3xl mx-auto mt-4 text-center">
             <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-text-secondary">Recent:</span>
                {items.map((item, index) => (
                    <button 
                        key={index}
                        onClick={() => onSearch(item)}
                        className="text-sm bg-base-200 text-text-secondary px-3 py-1 rounded-full hover:bg-base-300 hover:text-text-primary transition-colors"
                    >
                        {item}
                    </button>
                ))}
                 <button onClick={onClear} className="text-text-secondary hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-500/10" title="Clear history">
                    <ClearIcon className="w-4 h-4" />
                </button>
             </div>
        </div>
    );
}