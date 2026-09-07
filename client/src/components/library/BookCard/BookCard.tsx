import React from 'react';
import { Link } from 'react-router-dom';
import { IconBook, IconSparks, IconUsers } from '../../../types/icons';
import { Book } from '../../../types/book';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <Link to={`/book/${book.id}`}>
      <Card hoverable className="h-full">
        <div className="aspect-[3/4] bg-gradient-light rounded-lg mb-4 flex items-center justify-center overflow-hidden">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <IconBook size={48} color="#235347" />
          )}
        </div>

        <h3 className="text-lg font-serif text-primary-900 mb-1 line-clamp-1">{book.title}</h3>
        <p className="text-sm text-gray-600 mb-2">by {book.authors?.display_name || 'Unknown Author'}</p>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{book.description}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {book.tags?.slice(0, 3).map((tag: string) => (
            <Badge key={tag} size="sm" variant="default">
              {tag}
            </Badge>
          ))}
          {book.tags && book.tags.length > 3 && (
            <Badge size="sm" variant="default">+{book.tags.length - 3}</Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-primary-100 pt-3">
          <span className="flex items-center gap-1">
            <IconBook size={14} color="#8EB69B" />
            {book.total_reads || 0} reads
          </span>
          <span className="flex items-center gap-1">
            <IconSparks size={14} color="#F4A460" />
            {book.total_sparks || 0} Sparks
          </span>
          <span className="flex items-center gap-1">
            <IconUsers size={14} color="#8EB69B" />
            {book.total_chapters || 0} ch
          </span>
        </div>
      </Card>
    </Link>
  );
};