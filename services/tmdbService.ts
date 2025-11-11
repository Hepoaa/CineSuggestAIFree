
import { TMDB_API_KEY, TMDB_API_BASE_URL } from '../constants.ts';
import { TMDbResponse, TMDbResult, TMDbKeywordResponse, SortOption, WatchProviderResponse, ProviderInfo, Genre } from '../types.ts';

const fetchFromTMDb = async <T>(endpoint: string, language: string = 'en-US'): Promise<T> => {
  const url = `${TMDB_API_BASE_URL}/${endpoint}`;
  const separator = url.includes('?') ? '&' : '?';
  const finalUrl = `${url}${separator}api_key=${TMDB_API_KEY}&language=${language}`;

  try {
    const response = await fetch(finalUrl);
    if (!response.ok) {
      throw new Error(`TMDb API request failed for ${endpoint} with status ${response.status}`);
    }
    return response.json() as Promise<T>;
  } catch (error) {
    console.error(`Error fetching from TMDb endpoint ${endpoint}:`, error);
    throw new Error(`Failed to fetch data from TMDb for ${endpoint}.`);
  }
};

const getSortByValue = (sortOption: SortOption, mediaType: 'movie' | 'tv'): string => {
    switch(sortOption) {
        case 'release_date': 
            return mediaType === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc';
        case 'rating': return 'vote_average.desc';
        case 'popularity':
        default: return 'popularity.desc';
    }
}

export const searchMedia = async (query: string, page: number = 1, language: string): Promise<TMDbResult[]> => {
  if (!query) return [];
  const data = await fetchFromTMDb<TMDbResponse>(`search/multi?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`, language);
  return data.results.filter(result => (result.media_type === 'movie' || result.media_type === 'tv') && result.poster_path);
};

export const getTrending = async (page: number = 1, language: string): Promise<TMDbResult[]> => {
  const data = await fetchFromTMDb<TMDbResponse>(`trending/all/week?page=${page}`, language);
  return data.results.filter(result => (result.media_type === 'movie' || result.media_type === 'tv') && result.poster_path);
};

let keywordCache: Map<string, number> = new Map();

export const getKeywordIds = async (keywords: string[], language: string): Promise<number[]> => {
    if (!keywords || keywords.length === 0) return [];

    const uniqueKeywords = [...new Set(keywords.map(k => k.toLowerCase().trim()))];
    const cachedIds: number[] = [];
    const keywordsToFetch: string[] = [];

    for (const keyword of uniqueKeywords) {
        if (keywordCache.has(keyword)) {
            cachedIds.push(keywordCache.get(keyword)!);
        } else {
            keywordsToFetch.push(keyword);
        }
    }

    if (keywordsToFetch.length > 0) {
        const keywordPromises = keywordsToFetch.map(keyword =>
            fetchFromTMDb<TMDbKeywordResponse>(`search/keyword?query=${encodeURIComponent(keyword)}&page=1`, language)
        );
        const keywordResponses = await Promise.all(keywordPromises);

        keywordResponses.forEach((res, index) => {
            if (res.results.length > 0) {
                const keywordId = res.results[0].id;
                const originalKeyword = keywordsToFetch[index];
                cachedIds.push(keywordId);
                keywordCache.set(originalKeyword, keywordId);
            }
        });
    }

    return [...new Set(cachedIds)]; // Return unique IDs
};


let genreCache: { movie: Genre[], tv: Genre[] } = { movie: [], tv: [] };

const getGenreList = async (type: 'movie' | 'tv', language: string): Promise<Genre[]> => {
    if (genreCache[type].length > 0) {
        return genreCache[type];
    }
    const data = await fetchFromTMDb<{ genres: Genre[] }>(`genre/${type}/list`, language);
    genreCache[type] = data.genres;
    return data.genres;
};

export const getGenreIds = async (genreNames: string[], type: 'movie' | 'tv', language: string): Promise<number[]> => {
    if (!genreNames || genreNames.length === 0) return [];
    const genreList = await getGenreList(type, language);
    const lowerCaseGenreNames = genreNames.map(g => g.toLowerCase().trim());
    
    return genreList
        .filter(genre => lowerCaseGenreNames.includes(genre.name.toLowerCase().trim()))
        .map(genre => genre.id);
};

export const discoverMedia = async (
    type: 'movie' | 'tv', 
    genreIds: number[], 
    keywordIds: number[], 
    page: number = 1, 
    sortOption: SortOption = 'popularity', 
    language: string,
    year?: number
): Promise<TMDbResult[]> => {
    if (genreIds.length === 0 && keywordIds.length === 0 && !year) return [];

    const sortBy = getSortByValue(sortOption, type);
    let endpoint = `discover/${type}?sort_by=${sortBy}&page=${page}&include_adult=false`;

    if (genreIds.length > 0) {
        endpoint += `&with_genres=${genreIds.join(',')}`;
    }
    if (keywordIds.length > 0) {
        endpoint += `&with_keywords=${keywordIds.join(',')}`;
    }
    if (year) {
        const yearParam = type === 'movie' ? 'primary_release_year' : 'first_air_date_year';
        endpoint += `&${yearParam}=${year}`;
    }

    const data = await fetchFromTMDb<TMDbResponse>(endpoint, language);
    return data.results.map(r => ({ ...r, media_type: type }));
};

export const getMediaDetails = async (mediaType: 'movie' | 'tv', id: number, language: string): Promise<TMDbResult | null> => {
    if (!mediaType || !id) return null;
    const data = await fetchFromTMDb<TMDbResult>(`${mediaType}/${id}?append_to_response=genres`, language);
    return { ...data, media_type: mediaType };
};

export const getSimilarMedia = async (mediaType: 'movie' | 'tv', id: number, language: string): Promise<TMDbResult[]> => {
    if (!mediaType || !id) return [];
    const data = await fetchFromTMDb<TMDbResponse>(`${mediaType}/${id}/similar`, language);
    return data.results.filter(result => result.poster_path).map(r => ({ ...r, media_type: mediaType }));
};

export const getRecommendedMedia = async (mediaType: 'movie' | 'tv', id: number, language: string): Promise<TMDbResult[]> => {
    if (!mediaType || !id) return [];
    const data = await fetchFromTMDb<TMDbResponse>(`${mediaType}/${id}/recommendations`, language);
    return data.results.filter(result => result.poster_path).map(r => ({ ...r, media_type: mediaType }));
};

export const getWatchProviders = async (mediaType: 'movie' | 'tv', id: number, region: string): Promise<ProviderInfo | null> => {
    if (!mediaType || !id || !region) return null;
    const data = await fetchFromTMDb<WatchProviderResponse>(`${mediaType}/${id}/watch/providers`);
    return data.results?.[region] || null;
};
