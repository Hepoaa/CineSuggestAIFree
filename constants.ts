import { LanguageOption } from './types.ts';

export const TMDB_API_KEY = 'bc0bdde22b34c3195067e0880f8295e7';
export const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const TMDB_PAGE_SIZE = 20; // TMDb API returns 20 results per page by default

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
    { code: 'en-US', region: 'US', label: '🇺🇸 English (US)' },
    { code: 'es-ES', region: 'ES', label: '🇪🇸 Español (España)' },
    { code: 'es-MX', region: 'MX', label: '🇲🇽 Español (México)' },
    { code: 'fr-FR', region: 'FR', label: '🇫🇷 Français (France)' },
    { code: 'de-DE', region: 'DE', label: '🇩🇪 Deutsch (Deutschland)' },
    { code: 'it-IT', region: 'IT', label: '🇮🇹 Italiano (Italia)' },
    { code: 'pt-BR', region: 'BR', label: '🇧🇷 Português (Brasil)' },
];
