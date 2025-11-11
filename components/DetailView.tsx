
import React from 'react';
import { DetailedTMDbResult, TMDbResult } from '../types.ts';
import { TMDB_IMAGE_BASE_URL } from '../constants.ts';
import { MovieCard } from './MovieCard.tsx';

interface DetailViewProps {
    item: DetailedTMDbResult | null;
    isOpen: boolean;
    isLoading: boolean;
    onClose: () => void;
    onToggleFavorite: (item: TMDbResult) => void;
    isFavorite: boolean;
    onSelectSimilar: (item: TMDbResult) => void;
    favorites: string[];
}

const StarIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
    </svg>
);

const HeartIcon: React.FC<{className: string, isFavorite: boolean}> = ({className, isFavorite}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
);

export const DetailView: React.FC<DetailViewProps> = ({ item, isOpen, isLoading, onClose, onToggleFavorite, isFavorite, onSelectSimilar, favorites }) => {
    if (!isOpen) return null;

    const backdropUrl = item?.backdrop_path ? `${TMDB_IMAGE_BASE_URL.replace('w500', 'w1280')}${item.backdrop_path}` : '';
    const posterUrl = item?.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : 'https://via.placeholder.com/500x750/0b0b0b/ff6a00?text=No+Image';
    const title = item?.title || item?.name;
    const releaseDate = item?.release_date || item?.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';

    const streamingProviders = item?.watchProviders?.flatrate?.slice(0, 5) || [];

    const handleFavoriteClick = () => {
        if(item) onToggleFavorite(item);
    }
    
    return (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            <div 
                className="relative bg-base-100 w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl overflow-y-auto m-4 animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-base-100/80 z-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-accent"></div>
                    </div>
                )}
                {item && !isLoading && (
                    <>
                        {/* Backdrop and Header */}
                        <div className="relative h-60 md:h-80">
                            <img src={backdropUrl} alt={title ? `Backdrop for ${title}` : 'Movie or series backdrop'} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                            <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/50 to-transparent"></div>
                            <button onClick={onClose} aria-label="Close details view" className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-brand-accent transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Main Content */}
                        <div className="p-6 md:p-8 -mt-32 md:-mt-40 relative">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="md:w-1/3 flex-shrink-0">
                                    <img src={posterUrl} alt={title} className="w-full h-auto rounded-lg shadow-lg aspect-[2/3]"/>
                                </div>
                                <div className="md:w-2/3 text-left">
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{title}</h1>
                                    <div className="flex items-center gap-4 mt-2 text-text-secondary">
                                        <span>{year}</span>
                                        <div className="flex items-center gap-1">
                                            <StarIcon className="w-5 h-5 text-yellow-400" />
                                            <span className="font-bold text-white">{item.vote_average.toFixed(1)}</span>
                                        </div>
                                        <span className="uppercase text-sm font-bold">{item.media_type}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {item.genres?.map(genre => (
                                            <span key={genre.id} className="bg-base-200 text-text-secondary text-xs font-semibold px-2 py-1 rounded-full">{genre.name}</span>
                                        ))}
                                    </div>
                                    <p className="mt-6 text-text-secondary">{item.overview}</p>
                                    
                                    <div className="flex items-center gap-4 mt-8">
                                        <button onClick={handleFavoriteClick} className={`flex items-center gap-2 font-bold py-3 px-6 rounded-full transition-colors ${isFavorite ? 'bg-brand-accent text-white' : 'bg-base-200 hover:bg-base-300'}`}>
                                            <HeartIcon className="w-6 h-6" isFavorite={isFavorite} />
                                            {isFavorite ? 'Favorited' : 'Add to Favorites'}
                                        </button>
                                    </div>

                                    {streamingProviders.length > 0 && (
                                         <div className="mt-8">
                                            <h3 className="font-bold text-white">Available on:</h3>
                                            <div className="flex items-center gap-3 mt-3">
                                                {streamingProviders.map(p => (
                                                    <a key={p.provider_id} href={item.watchProviders?.link} target="_blank" rel="noreferrer" title={p.provider_name}>
                                                        <img src={`${TMDB_IMAGE_BASE_URL.replace('w500', 'w92')}${p.logo_path}`} alt={p.provider_name} className="w-10 h-10 rounded-lg hover:scale-110 transition-transform" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                        {/* Similar Items Section */}
                        {item.similar && item.similar.length > 0 && (
                            <div className="p-6 md:p-8 border-t border-base-300">
                                <h2 className="text-2xl font-bold text-white mb-4">You Might Also Like</h2>
                                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin">
                                    {item.similar.map(similarItem => {
                                      const isSimFavorite = favorites.includes(`${similarItem.media_type}:${similarItem.id}`);
                                      return (
                                        <div key={similarItem.id} className="w-40 flex-shrink-0">
                                            <MovieCard 
                                                item={{...similarItem, isFavorite: isSimFavorite}} 
                                                onToggleFavorite={onToggleFavorite} 
                                                onViewDetails={onSelectSimilar}
                                            />
                                        </div>
                                      );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            {/* FIX: The 'jsx' and 'global' props are not standard HTML attributes for the <style> tag and are specific to CSS-in-JS libraries like styled-jsx. Removing them resolves the TypeScript error. */}
            <style>{`
                .animate-fade-in-up {
                    animation: fadeInUp 0.3s ease-out forwards;
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .scrollbar-thin {
                    scrollbar-width: thin;
                    scrollbar-color: #2a2a2a transparent;
                }
                .scrollbar-thin::-webkit-scrollbar {
                    height: 8px;
                    width: 8px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background-color: #2a2a2a;
                    border-radius: 20px;
                    border: 3px solid transparent;
                }
            `}</style>
        </div>
    );
};