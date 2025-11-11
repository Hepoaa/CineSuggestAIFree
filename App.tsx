
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header.tsx';
import { SearchBar } from './components/SearchBar.tsx';
import { ResultsGrid } from './components/ResultsGrid.tsx';
import { Loader } from './components/Loader.tsx';
import { EmptyState } from './components/EmptyState.tsx';
import { History } from './components/History.tsx';
import { FilterControls } from './components/FilterControls.tsx';
import { getSearchTermsFromAI, getChatResponseFromAI } from './services/aiService.ts';
import { searchMedia, getTrending, getMediaDetails, getWatchProviders, getSimilarMedia, getRecommendedMedia, getKeywordIds, getGenreIds, discoverMedia } from './services/tmdbService.ts';
import { TMDbResult, AISearchData, View, SortOption, FilterOption, DetailedTMDbResult, ChatMessage } from './types.ts';
import { useLocalStorage } from './hooks/useLocalStorage.ts';
import { Welcome } from './components/Welcome.tsx';
import { TMDB_PAGE_SIZE, SUPPORTED_LANGUAGES } from './constants.ts';
import { DetailView } from './components/DetailView.tsx';
import { ChatView } from './components/ChatView.tsx';


const ChatIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
        <path fillRule="evenodd" d="M5.337 21.063a.75.75 0 0 1-.613.882c-1.34.22-2.58.6-3.737 1.125a.75.75 0 0 1-1.002-.873 11.233 11.233 0 0 1 2.25-5.223.75.75 0 0 1 .43-.33L3 16.5c-1.468-1.468-2.25-3.41-2.25-5.437 0-4.142 4.03-7.5 9-7.5s9 3.358 9 7.5c0 4.142-4.03 7.5-9 7.5a10.02 10.02 0 0 1-5.337-1.563Z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M15.75 8.25a.75.75 0 0 1 .75.75v5.13l1.19-1.19a.75.75 0 0 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.19 1.19V9a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
);


const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPaginating, setIsPaginating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TMDbResult[]>([]);
  const [view, setView] = useState<View>('trending');
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<SortOption>('popularity');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [loaderMessage, setLoaderMessage] = useState<string>('AI is analyzing your request...');
  
  const [favorites, setFavorites] = useLocalStorage<string[]>('cinesuggest_favorites', []);
  const [history, setHistory] = useLocalStorage<string[]>('cinesuggest_history', []);
  
  // Localization State
  const [language, setLanguage] = useLocalStorage<string>('cinesuggest_language', 'en-US');
  const [region, setRegion] = useLocalStorage<string>('cinesuggest_region', 'US');


  // Detail View State
  const [selectedItem, setSelectedItem] = useState<TMDbResult | null>(null);
  const [detailedData, setDetailedData] = useState<DetailedTMDbResult | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
      { role: 'ai', content: "Hi! I'm CineSuggest AI. Ask me for movie recommendations, trivia, or anything film-related!" }
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Pagination and Refetching State
  const [currentPage, setCurrentPage] = useState(1);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [currentSearchData, setCurrentSearchData] = useState<AISearchData | null>(null);
  const isInitialRender = useRef(true);
  const isNewSearchStarting = useRef(false);

  const handleError = (err: unknown) => {
    const message = err instanceof Error ? err.message : 'An unknown error occurred.';
    setError(`An error occurred: ${message}`);
    console.error(err);
    setIsLoading(false);
    setIsPaginating(false);
    setIsDetailLoading(false);
  };
  
  const processAndSetResults = useCallback(async (newResults: TMDbResult[], existingResults: TMDbResult[] = []) => {
      const resultsWithProvidersPromises = newResults.map(async (result) => {
        if (!result || !result.id) return result;
        const providers = await getWatchProviders(result.media_type, result.id, region);
        return { ...result, watchProviders: providers };
      });
      
      const enrichedNewResults = await Promise.all(resultsWithProvidersPromises);

      const combined = [...existingResults, ...enrichedNewResults];
      const uniqueResultsMap = new Map<string, TMDbResult>();
      combined.forEach(result => {
        if (result && result.id) { 
          uniqueResultsMap.set(`${result.media_type}-${result.id}`, result);
        }
      });
      const uniqueResults = Array.from(uniqueResultsMap.values());
      setResults(uniqueResults);

      setCanLoadMore(newResults.length >= TMDB_PAGE_SIZE);
  }, [region]);
  
  const executeSearch = useCallback(async (searchData: AISearchData, page: number, lang: string) => {
    if (!searchData.search_query) {
        return [];
    }
    return await searchMedia(searchData.search_query, page, lang);
  }, []);

  const startNewFetch = useCallback(async () => {
    if (view === 'favorites') return;
    setCurrentPage(1);
    setResults([]);
    setCanLoadMore(true);
    setIsLoading(true);
    setError(null);

    try {
        if (view === 'trending') {
            const trendingResults = await getTrending(1, language);
            await processAndSetResults(trendingResults, []);
        } else if (view === 'results' && currentSearchData) {
            const searchResults = await executeSearch(currentSearchData, 1, language);
            await processAndSetResults(searchResults, []);
        }
    } catch (err) {
        handleError(err);
    } finally {
        setIsLoading(false);
    }
  }, [view, language, currentSearchData, executeSearch, processAndSetResults]);

  // Effect to handle refetching when language changes
  useEffect(() => {
    if (isInitialRender.current) return;
    if (isNewSearchStarting.current) return;
    startNewFetch();
  }, [language, startNewFetch]);

  // Initial load effect - rewritten for robustness
  useEffect(() => {
    // This logic should only run once on component mount.
    const initialFetch = async () => {
      let langCodeToUse = language;
      let regionToUse = region;

      // Detect language if it's not set in localStorage yet
      if (!localStorage.getItem('cinesuggest_language')) {
        const browserLang = navigator.language;
        const matchedLang = SUPPORTED_LANGUAGES.find(l => l.code === browserLang) 
                         || SUPPORTED_LANGUAGES.find(l => l.code.startsWith(browserLang.split('-')[0]))
                         || SUPPORTED_LANGUAGES[0];
        
        // Set state for subsequent renders
        setLanguage(matchedLang.code);
        setRegion(matchedLang.region);

        // Use the newly detected language for the initial fetch
        langCodeToUse = matchedLang.code;
        regionToUse = matchedLang.region;
      }

      setIsLoading(true);
      setLoaderMessage('Fetching trending titles...');
      setError(null);
      
      try {
        const trendingResults = await getTrending(1, langCodeToUse);
        
        // Manually process results for this initial fetch since `processAndSetResults` depends on `region` state which might not be updated yet
        const resultsWithProvidersPromises = trendingResults.map(async (result) => {
          if (!result || !result.id) return result;
          const providers = await getWatchProviders(result.media_type, result.id, regionToUse);
          return { ...result, watchProviders: providers };
        });
        const enrichedNewResults = await Promise.all(resultsWithProvidersPromises);

        const uniqueResultsMap = new Map<string, TMDbResult>();
        enrichedNewResults.forEach(result => {
          if (result && result.id) { 
            uniqueResultsMap.set(`${result.media_type}-${result.id}`, result);
          }
        });
        
        setResults(Array.from(uniqueResultsMap.values()));
        setCanLoadMore(enrichedNewResults.length >= TMDB_PAGE_SIZE);
      } catch (err) { 
        handleError(err); 
      } finally { 
        setIsLoading(false); 
        isInitialRender.current = false;
      }
    };

    initialFetch();
    // This effect is INTENTIONALLY run only once on mount. Dependencies are handled manually inside.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    handleCloseDetailView();
    isNewSearchStarting.current = true;
    setIsLoading(true);
    setError(null);
    setResults([]);
    setView('results');
    setHasSearched(true);
    setCurrentPage(1);
    setCanLoadMore(true);
    setSortOption('popularity');
    setFilterOption('all');

    if (!history.includes(query)) {
        setHistory(prev => [query, ...prev.slice(0, 9)]);
    }

    try {
        setLoaderMessage('Understanding your request...');
        const aiResponse: AISearchData = await getSearchTermsFromAI(query);
        setCurrentSearchData(aiResponse);

        let searchResults: TMDbResult[] = [];
        
        const useDiscover = (aiResponse.genres && aiResponse.genres.length > 0) || (aiResponse.keywords && aiResponse.keywords.length > 0);

        if (useDiscover) {
            setLoaderMessage('Finding matches based on your description...');
            const mediaType = aiResponse.media_type;
            const typesToSearch: ('movie' | 'tv')[] = mediaType ? [mediaType] : ['movie', 'tv'];

            const discoverPromises = typesToSearch.map(async (type) => {
                const [genreIds, keywordIds] = await Promise.all([
                    getGenreIds(aiResponse.genres || [], type, language),
                    getKeywordIds(aiResponse.keywords || [], language)
                ]);

                if (keywordIds.length > 0 || genreIds.length > 0) {
                    return discoverMedia(type, genreIds, keywordIds, 1, 'popularity', language, aiResponse.year);
                }
                return [];
            });
            
            const resultsByType = await Promise.all(discoverPromises);
            searchResults = resultsByType.flat();
        } else {
            setLoaderMessage('Searching for titles...');
            const queryToSearch = aiResponse.search_query || query;
            searchResults = await searchMedia(queryToSearch, 1, language);
        }
        
        await processAndSetResults(searchResults, []);

    } catch (err) {
        handleError(err);
    } finally {
        setIsLoading(false);
        isNewSearchStarting.current = false;
    }
}, [history, setHistory, processAndSetResults, language]);
  
  const handleLoadMore = async () => {
    if (isPaginating || !canLoadMore) return;
    
    setIsPaginating(true);
    const nextPage = currentPage + 1;
    
    try {
      let newResults: TMDbResult[] = [];
      if (view === 'results' && currentSearchData) {
        const useDiscover = (currentSearchData.genres && currentSearchData.genres.length > 0) || (currentSearchData.keywords && currentSearchData.keywords.length > 0);
        
        if (useDiscover) {
            const mediaType = currentSearchData.media_type;
            const typesToSearch: ('movie' | 'tv')[] = mediaType ? [mediaType] : ['movie', 'tv'];

            const discoverPromises = typesToSearch.map(async (type) => {
                const [genreIds, keywordIds] = await Promise.all([
                    getGenreIds(currentSearchData.genres || [], type, language),
                    getKeywordIds(currentSearchData.keywords || [], language)
                ]);

                if (keywordIds.length > 0 || genreIds.length > 0) {
                    return discoverMedia(type, genreIds, keywordIds, nextPage, sortOption, language, currentSearchData.year);
                }
                return [];
            });
            const resultsByType = await Promise.all(discoverPromises);
            newResults = resultsByType.flat();
        } else {
            const queryToSearch = currentSearchData.search_query || '';
            newResults = await searchMedia(queryToSearch, nextPage, language);
        }
      } else if (view === 'trending') {
        newResults = await getTrending(nextPage, language);
      }

      await processAndSetResults(newResults, results);
      setCurrentPage(nextPage);
    } catch (err) {
      handleError(err);
    } finally {
      setIsPaginating(false);
    }
  };

  const handleToggleFavorite = (item: TMDbResult) => {
    const favoriteId = `${item.media_type}:${item.id}`;
    if (favorites.includes(favoriteId)) {
      setFavorites(prev => prev.filter(id => id !== favoriteId));
    } else {
      setFavorites(prev => [...prev, favoriteId]);
    }
  };
  
  const handleViewChange = async (newView: View) => {
      handleCloseDetailView();
      setView(newView);
      setHasSearched(false);
      setCanLoadMore(true);
      setResults([]);
      setCurrentPage(1);

      if (newView === 'trending') {
        setSortOption('popularity');
        setFilterOption('all');
        setIsLoading(true);
        try {
            const trendingResults = await getTrending(1, language);
            await processAndSetResults(trendingResults, []);
        } catch(err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
      } else if (newView === 'favorites') {
        setCanLoadMore(false);
        showFavorites();
      }
  }

  const showFavorites = useCallback(async () => {
    setIsLoading(true);
    setLoaderMessage('Loading your favorites...');
    setError(null);
    try {
        const favoriteDetailsPromises = favorites.map(favId => {
            const [mediaType, id] = favId.split(':');
            return getMediaDetails(mediaType as 'movie' | 'tv', parseInt(id, 10), language);
        });
        const favoriteItems = (await Promise.all(favoriteDetailsPromises)).filter(Boolean) as TMDbResult[];
        await processAndSetResults(favoriteItems, []);
    } catch (err) {
        handleError(err);
    } finally {
        setIsLoading(false);
    }
  }, [favorites, language, processAndSetResults]);

  const handleViewDetails = (item: TMDbResult) => {
    setSelectedItem(item);
  }
  
  const handleCloseDetailView = () => {
      setSelectedItem(null);
      setDetailedData(null);
  }
  
  const handleLanguageChange = (langCode: string) => {
    const selectedLang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    if (selectedLang) {
        setLanguage(selectedLang.code);
        setRegion(selectedLang.region);
    }
  }

  // Effect to fetch detailed data when an item is selected
  useEffect(() => {
    if (!selectedItem) {
        setDetailedData(null);
        return;
    }

    const fetchAllDetails = async () => {
      setIsDetailLoading(true);
      setError(null);
      setDetailedData(null);
      
      const [details, providers, similar, recommendations] = await Promise.all([
        getMediaDetails(selectedItem.media_type, selectedItem.id, language),
        getWatchProviders(selectedItem.media_type, selectedItem.id, region),
        getSimilarMedia(selectedItem.media_type, selectedItem.id, language),
        getRecommendedMedia(selectedItem.media_type, selectedItem.id, language)
      ]).catch(err => {
        handleError(err);
        return [null, null, null, null];
      });

      if (!details) {
        return;
      }
      
      const combinedSimilar = [...(similar || []), ...(recommendations || [])];
      const uniqueSimilarMap = new Map<number, TMDbResult>();
      combinedSimilar.forEach(item => {
          if (item.id !== selectedItem.id) {
              uniqueSimilarMap.set(item.id, item);
          }
      });
      const uniqueSimilar = Array.from(uniqueSimilarMap.values());

      setDetailedData({
        ...details,
        watchProviders: providers,
        similar: uniqueSimilar.slice(0, 20),
      });
      setIsDetailLoading(false);
    };

    fetchAllDetails();
  }, [selectedItem, language, region]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    setIsChatLoading(true);
    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: message }];
    setChatMessages(newMessages);

    try {
        const aiResponse = await getChatResponseFromAI(newMessages);
        setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (err) {
        setChatMessages(prev => [...prev, { role: 'error', content: 'Sorry, I ran into a problem. Please try again.' }]);
        console.error(err);
    } finally {
        setIsChatLoading(false);
    }
  };

  const displayedResults = useMemo(() => {
    let sortedAndFiltered = [...results];
    
    if (filterOption !== 'all') {
        sortedAndFiltered = sortedAndFiltered.filter(r => r.media_type === filterOption);
    }

    switch(sortOption) {
        case 'release_date':
            sortedAndFiltered.sort((a, b) => {
                const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
                const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
                return dateB - dateA;
            });
            break;
        case 'rating':
            sortedAndFiltered.sort((a, b) => b.vote_average - a.vote_average);
            break;
        case 'popularity':
        default:
            sortedAndFiltered.sort((a, b) => b.popularity - a.popularity);
            break;
    }

    return sortedAndFiltered.map(r => ({
      ...r,
      isFavorite: favorites.includes(`${r.media_type}:${r.id}`)
    }));
  }, [results, sortOption, filterOption, favorites]);

  const showFilterControls = view === 'trending' || (view === 'results' && results.length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
          onViewChange={handleViewChange} 
          language={language}
          onLanguageChange={handleLanguageChange}
      />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <SearchBar 
          onSearch={handleSearch} 
          isLoading={isLoading} 
        />
        <History items={history} onSearch={handleSearch} onClear={() => setHistory([])} />

        {showFilterControls && (
            <div className="my-8 flex justify-center">
                <FilterControls 
                    sortOption={sortOption}
                    filterOption={filterOption}
                    onSortChange={setSortOption}
                    onFilterChange={setFilterOption}
                    showSortControls={view !== 'results'}
                />
            </div>
        )}
        
        {error && <p className="text-red-500 text-center mt-8">{error}</p>}
        
        <div className="mt-8">
          {isLoading ? (
            <Loader message={loaderMessage} />
          ) : results.length > 0 ? (
            <ResultsGrid 
              results={displayedResults} 
              onToggleFavorite={handleToggleFavorite} 
              onLoadMore={handleLoadMore}
              canLoadMore={canLoadMore}
              isPaginating={isPaginating}
              onViewDetails={handleViewDetails}
            />
          ) : hasSearched ? (
            <EmptyState />
          ) : view !== 'favorites' ? ( 
            <Welcome />
          ) : (
            <p className="text-center text-text-secondary mt-16">You haven't added any favorites yet.</p>
          )
          }
        </div>
      </main>

      <DetailView 
        item={detailedData}
        isOpen={!!selectedItem}
        isLoading={isDetailLoading}
        onClose={handleCloseDetailView}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={selectedItem ? favorites.includes(`${selectedItem.media_type}:${selectedItem.id}`) : false}
        onSelectSimilar={handleViewDetails}
        favorites={favorites}
      />
       <ChatView 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          isLoading={isChatLoading}
      />
      {!isChatOpen && (
          <button 
              onClick={() => setIsChatOpen(true)}
              className="fixed bottom-6 right-6 bg-gradient-to-r from-brand-accent to-orange-500 text-white rounded-full p-4 shadow-lg hover:scale-110 transform transition-transform duration-300 z-20"
              aria-label="Open chat"
          >
              <ChatIcon />
          </button>
      )}
    </div>
  );
};

export default App;