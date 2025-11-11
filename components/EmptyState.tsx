
import React from 'react';

interface EmptyStateProps {}

const SearchIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

export const EmptyState: React.FC<EmptyStateProps> = () => {
  return (
    <div className="text-center mt-16 flex flex-col items-center">
      <SearchIcon className="w-24 h-24 text-base-300" />
      <h2 className="text-2xl font-bold mt-4 text-text-primary">No Results Found</h2>
      <p className="text-text-secondary mt-2 max-w-md">
        Try a different search, or ask our AI assistant in the bottom-right corner for help!
      </p>
    </div>
  );
};
