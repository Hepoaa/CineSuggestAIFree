
import React from 'react';
import { TMDbResult } from '../types.ts';
import { TMDB_IMAGE_BASE_URL } from '../constants.ts';

interface MovieCardProps {
  item: TMDbResult;
  onToggleFavorite: (item: TMDbResult) => void;
  onViewDetails: (item: TMDbResult) => void;
}

const StarIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
    </svg>
);

const HeartIcon: React.FC<{className: string, isFavorite: boolean}> = ({className, isFavorite}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
);

export const MovieCard: React.FC<MovieCardProps> = ({ item, onToggleFavorite, onViewDetails }) => {
  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const posterUrl = item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : 'https://via.placeholder.com/500x750/0b0b0b/ff6a00?text=No+Image';

  const streamingProviders = item.watchProviders?.flatrate?.slice(0, 4) || [];

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(item);
  }

  return (
    <div 
        className="bg-base-200 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-brand-accent/30 group cursor-pointer"
        onClick={() => onViewDetails(item)}
    >
      <div className="relative">
        <img src={posterUrl} alt={title} className="w-full h-auto object-cover aspect-[2/3]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
         <div className="absolute top-2 right-2 flex items-center bg-black/70 backdrop-blur-sm text-white text-sm font-bold px-2 py-1 rounded-full">
            <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
            <span>{item.vote_average.toFixed(1)}</span>
        </div>
        <button onClick={handleFavoriteClick} className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm p-2 rounded-full text-brand-accent opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
            <HeartIcon className="w-6 h-6" isFavorite={!!item.isFavorite} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-text-primary truncate" title={title}>{title}</h3>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-text-secondary">{year}</p>
          <span className="text-xs font-semibold uppercase bg-brand-accent/20 text-brand-accent px-2 py-1 rounded-full">
            {item.media_type}
          </span>
        </div>
        {streamingProviders.length > 0 && (
            <div className="mt-3 pt-3 border-t border-base-300/50">
                <div className="flex items-center gap-2">
                    {streamingProviders.map(p => (
                        <img 
                            key={p.provider_id} 
                            src={`${TMDB_IMAGE_BASE_URL.replace('w500', 'w92')}${p.logo_path}`} 
                            alt={p.provider_name} 
                            title={p.provider_name} 
                            className="w-7 h-7 rounded-md" 
                        />
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};