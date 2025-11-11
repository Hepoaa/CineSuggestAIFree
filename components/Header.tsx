import React from 'react';
import { View, LanguageOption } from '../types.ts';
import { SUPPORTED_LANGUAGES } from '../constants.ts';


interface HeaderProps {
    onViewChange: (view: View) => void;
    language: string;
    onLanguageChange: (langCode: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onViewChange, language, onLanguageChange }) => {
  return (
    <header className="py-4 text-center bg-base-200/50 backdrop-blur-sm sticky top-0 z-10 border-b border-base-300">
        <div className="container mx-auto flex justify-between items-center px-4">
            <div className="text-left">
                 <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-brand-accent to-orange-500 text-transparent bg-clip-text">
                    CineSuggest AI
                </h1>
                <p className="text-text-secondary text-sm hidden md:block">
                    Find movies & series by describing anything you remember.
                </p>
            </div>
            <nav className="flex items-center gap-4 md:gap-6">
                <div className="relative">
                    <select 
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value)}
                        className="bg-base-200 text-text-secondary font-semibold rounded-md py-1.5 pl-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer"
                        aria-label="Select language and region"
                    >
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.label}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
                <button onClick={() => onViewChange('trending')} className="text-text-secondary hover:text-brand-accent transition-colors duration-200 font-semibold">Trending</button>
                <button onClick={() => onViewChange('favorites')} className="text-text-secondary hover:text-brand-accent transition-colors duration-200 font-semibold">Favorites</button>
            </nav>
        </div>
    </header>
  );
};