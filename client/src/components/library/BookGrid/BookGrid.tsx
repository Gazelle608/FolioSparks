import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../../../types/book';

interface BookGridProps {
  books: Book[];
}

export const BookGrid: React.FC<BookGridProps> = ({ books }) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No books found. Check back soon for new stories!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <Link to={`/book/${book.id}`} key={book.id}>
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 h-full overflow-hidden">
            <div className="p-6">
              <div className="aspect-[3/4] bg-gradient-light rounded-lg mb-4 flex items-center justify-center text-4xl">
                📖
              </div>
              <h3 className="text-xl font-serif text-primary-900 mb-1">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-2">by {book.authors?.display_name || 'Unknown Author'}</p>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{book.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {book.tags?.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{book.total_reads || 0} reads</span>
                <span>⭐ {book.total_sparks || 0} Sparks</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};