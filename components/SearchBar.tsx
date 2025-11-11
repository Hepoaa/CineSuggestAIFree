
import React, { useState, useRef } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
      setQuery('');
      inputRef.current?.focus();
  }

  return (
    <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="w-full">
            <div className="relative">
                <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., 'a sad shark movie with robots'"
                disabled={isLoading}
                className="w-full pl-5 pr-40 py-4 text-lg text-text-primary bg-base-200 border-2 border-base-300 rounded-full focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all duration-300 disabled:opacity-50"
                aria-label="Search for movies and series"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
                     {query && !isLoading && (
                        <button type="button" onClick={handleClear} className="text-text-secondary hover:text-text-primary mr-2" aria-label="Clear search">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-10.707a1 1 0 0 0-1.414-1.414L10 8.586 7.707 6.293a1 1 0 0 0-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 1 0 1.414 1.414L10 11.414l2.293 2.293a1 1 0 0 0 1.414-1.414L11.414 10l2.293-2.293Z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                    <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-brand-accent to-orange-500 text-white font-bold py-2 px-6 rounded-full hover:scale-105 transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {isLoading ? '...' : 'Search'}
                    </button>
                </div>
            </div>
        </form>
    </div>
  );
};