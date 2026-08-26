import React, { useEffect, useState } from 'react';
import { supabase } from '../../api/client';
import { BookGrid } from '../../components/library/BookGrid';
import { GenreFilter } from '../../components/library/GenreFilter';
import { SearchBar } from '../../components/common/SearchBar';
import { Book } from '../../types/book';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const Library: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          authors:author_id (display_name, donation_platforms)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
      setFilteredBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = books;
    
    if (selectedGenre) {
      filtered = filtered.filter(book => 
        book.genre?.includes(selectedGenre)
      );
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.description?.toLowerCase().includes(query) ||
        book.authors?.display_name?.toLowerCase().includes(query) ||
        book.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredBooks(filtered);
  }, [selectedGenre, searchQuery, books]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchBooks}
          className="mt-4 btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-serif text-primary-900">The Library</h1>
            <p className="text-gray-600 text-sm mt-1">
              Serials updated chapter by chapter. Every story page shows exactly where the author's donations go.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {filteredBooks.length} {filteredBooks.length === 1 ? 'story' : 'stories'} found
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search titles, authors, or tags..."
            />
          </div>
          <GenreFilter 
            selectedGenre={selectedGenre}
            onGenreSelect={setSelectedGenre}
          />
        </div>
        
        {/* Book Grid */}
        <BookGrid books={filteredBooks} />
      </div>
    </div>
  );
};