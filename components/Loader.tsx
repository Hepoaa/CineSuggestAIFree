
import React from 'react';

interface LoaderProps {
    message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = 'AI is analyzing your request...' }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-16">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-accent"></div>
      <p className="text-text-secondary text-xl mt-4">{message}</p>
    </div>
  );
};
