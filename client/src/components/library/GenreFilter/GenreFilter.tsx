import React from 'react';

interface GenreFilterProps {
  selectedGenre: string | null;
  onGenreSelect: (genre: string | null) => void;
}

const GENRES = ['EPIC FANTASY', 'SCI-FI', 'MYSTERY', 'ROMANCE', 'LITERARY', 'THRILLER'];

export const GenreFilter: React.FC<GenreFilterProps> = ({ selectedGenre, onGenreSelect }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onGenreSelect(null)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          !selectedGenre 
            ? 'bg-primary-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        All
      </button>
      {GENRES.map((genre) => (
        <button
          key={genre}
          onClick={() => onGenreSelect(genre)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedGenre === genre 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {genre}
        </button>
      ))}
    </div>
  );
};