import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconTrending, IconSparks, IconUsers, IconBook } from '../../../types/icons';
import { booksApi } from '../../../api';
import { Book } from '../../../types/book';
import { Badge } from '../../common/Badge';
import { Card } from '../../common/Card';

export const BurningNow: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBurningBooks = async () => {
      const { data } = await booksApi.getBurningBooks(5);
      if (data) setBooks(data as Book[]);
      setLoading(false);
    };
    fetchBurningBooks();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 bg-primary-50">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-primary-600">Loading trending stories...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-primary-50">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <IconTrending size={32} color="#235347" />
          <h2 className="text-4xl font-serif text-primary-900">Burning right now</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {books.map((book) => (
            <Link to={`/book/${book.id}`} key={book.id}>
              <Card hoverable className="h-full">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-24 h-32 bg-primary-200 rounded-lg flex items-center justify-center text-3xl">
                    <IconBook size={40} color="#235347" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="spark" size="sm" className="mb-1">
                          <IconSparks size={12} className="mr-1" />
                          Trending
                        </Badge>
                        <h3 className="text-lg font-serif text-primary-900 truncate">{book.title}</h3>
                        <p className="text-sm text-gray-600">by {book.authors?.display_name}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-2">{book.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {book.tags?.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} size="sm" variant="default">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <IconBook size={14} color="#8EB69B" />
                        {book.total_reads || 0} reads
                      </span>
                      <span className="flex items-center gap-1">
                        <IconSparks size={14} color="#F4A460" />
                        {book.total_sparks || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconUsers size={14} color="#8EB69B" />
                        {book.total_chapters || 0} chapters
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};