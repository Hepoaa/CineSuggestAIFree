
import React from 'react';

const IdeaIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a15.045 15.045 0 0 1-3.75 0M12 6.75h.008v.008H12V6.75Zm-2.25-1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm3 0a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
    </svg>
);

export const Welcome: React.FC = () => {
  return (
    <div className="text-center mt-16 flex flex-col items-center">
        <IdeaIcon className="w-24 h-24 text-base-300" />
        <h2 className="text-2xl font-bold mt-4 text-text-primary">Find Your Next Watch</h2>
        <p className="text-text-secondary mt-2 max-w-lg">
            Can't remember a title? Just describe what it's about. Let our AI do the hard work of finding it for you.
        </p>
        <div className="mt-8 text-left bg-base-200 p-6 rounded-lg max-w-md w-full">
            <h3 className="font-semibold text-text-primary mb-3">Try examples like:</h3>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li>"A movie like Inception but with magic"</li>
                <li>"TV show about a chess prodigy in the 60s"</li>
                <li>"That sci-fi movie where they grow potatoes on Mars"</li>
            </ul>
        </div>
    </div>
  );
};