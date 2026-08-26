import React from 'react';

interface LibraryHeaderProps {
  totalBooks: number;
}

export const LibraryHeader: React.FC<LibraryHeaderProps> = ({ totalBooks }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-4xl font-serif text-primary-900">The Library</h1>
        <p className="text-gray-600 text-sm mt-1">
          Serials updated chapter by chapter. Every story page shows exactly where the author's donations go.
        </p>
      </div>
      <div className="text-sm text-gray-500">
        {totalBooks} {totalBooks === 1 ? 'story' : 'stories'} found
      </div>
    </div>
  );
};