
export interface AISearchData {
  search_query: string;
}

export interface TMDbKeyword {
  id: number;
  name: string;
}

export interface Genre {
    id: number;
    name: string;
}

export interface TMDbResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  popularity: number;
  isFavorite?: boolean;
  genres?: Genre[];
  watchProviders?: ProviderInfo | null;
}

export interface DetailedTMDbResult extends TMDbResult {
    similar: TMDbResult[];
}

export interface TMDbResponse {
  results: TMDbResult[];
  total_pages: number;
}

export interface TMDbKeywordResponse {
    results: TMDbKeyword[];
}

// Types for Watch Providers
export interface Provider {
    logo_path: string;
    provider_id: number;
    provider_name: string;
    display_priority: number;
}

export interface ProviderInfo {
    link: string;
    flatrate?: Provider[];
    rent?: Provider[];
    buy?: Provider[];
}

export interface WatchProviderResponse {
    id: number;
    results: {
        [countryCode: string]: ProviderInfo;
    }
}

export interface ChatMessage {
  role: 'user' | 'ai' | 'error';
  content: string;
}

export type View = 'trending' | 'results' | 'favorites';

export type SortOption = 'popularity' | 'release_date' | 'rating';

export type FilterOption = 'all' | 'movie' | 'tv';

export interface LanguageOption {
  code: string; // e.g., 'en-US'
  region: string; // e.g., 'US'
  label: string; // e.g., '🇺🇸 English (US)'
}
