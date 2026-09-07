import React, { useState } from 'react';
import { IconSearch, IconClose } from '../../../types/icons';
import { Input } from '../Input';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search titles, authors, or tags...',
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        placeholder={placeholder}
        icon={IconSearch}
        iconPosition="left"
        className={`
          ${isFocused ? 'border-primary-400 shadow-sm' : ''}
          transition-all duration-200
        `}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"
        >
          <IconClose size={18} color="#8EB69B" />
        </button>
      )}
    </div>
  );
};