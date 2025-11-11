import React from 'react';
import { TMDbResult } from '../types.ts';
import { MovieCard } from './MovieCard.tsx';

interface ResultsGridProps {
  results: TMDbResult[];
  onToggleFavorite: (item: TMDbResult) => void;
  onLoadMore: () => void;
  canLoadMore: boolean;
  isPaginating: boolean;
  onViewDetails: (item: TMDbResult) => void;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({ results, onToggleFavorite, onLoadMore, canLoadMore, isPaginating, onViewDetails }) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {results.map((result) => (
          <MovieCard 
              key={`${result.media_type}-${result.id}`} 
              item={result} 
              onToggleFavorite={onToggleFavorite}
              onViewDetails={onViewDetails}
          />
        ))}
      </div>
      {canLoadMore && (
        <div className="text-center mt-12">
            <button 
              onClick={onLoadMore}
              disabled={isPaginating}
              className="bg-brand-accent text-white font-bold py-3 px-8 rounded-full hover:scale-105 transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPaginating ? 'Loading...' : 'Load More'}
            </button>
        </div>
      )}
    </>
  );
};