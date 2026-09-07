import React from 'react';
import { Book } from '../../../types/book';
import { BookCard } from '../BookCard';
import { IconBook } from '../../../types/icons';

interface BookGridProps {
  books: Book[];
  loading?: boolean;
}

export const BookGrid: React.FC<BookGridProps> = ({ books, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-primary-100 rounded-lg mb-4" />
            <div className="h-4 bg-primary-100 rounded w-3/4 mb-2" />
            <div className="h-3 bg-primary-100 rounded w-1/2 mb-2" />
            <div className="h-3 bg-primary-100 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <IconBook size={48} color="#8EB69B" className="mx-auto mb-4" />
        <p className="text-gray-500">No books found. Check back soon for new stories!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
};