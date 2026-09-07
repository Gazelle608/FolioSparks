import React from 'react';
import { GENRES } from '../../../types/book';
import { Badge } from '../../common/Badge';

interface GenreFilterProps {
  selectedGenre: string | null;
  onGenreSelect: (genre: string | null) => void;
}

export const GenreFilter: React.FC<GenreFilterProps> = ({
  selectedGenre,
  onGenreSelect,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={selectedGenre === null ? 'primary' : 'default'}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onGenreSelect(null)}
      >
        All
      </Badge>
      {GENRES.map((genre) => (
        <Badge
          key={genre}
          variant={selectedGenre === genre ? 'primary' : 'default'}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onGenreSelect(selectedGenre === genre ? null : genre)}
        >
          {genre}
        </Badge>
      ))}
    </div>
  );
};