import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../api/client';
import { Book } from '../../../types/book';

export const BurningNow: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBurningBooks();
  }, []);

  const fetchBurningBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          authors:author_id (display_name)
        `)
        .eq('status', 'published')
        .order('total_reads', { ascending: false })
        .limit(6);

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching burning books:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-primary-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-serif text-primary-900 mb-8 text-center">🔥 Burning Right Now</h2>
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-primary-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl font-serif text-primary-900 mb-8 text-center">🔥 Burning Right Now</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Link to={`/book/${book.id}`} key={book.id} className="group">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-primary-600 uppercase">
                      {book.genre?.[0] || 'Fiction'}
                    </span>
                    <span className="text-xs text-gray-400">{book.total_reads || 0} reads</span>
                  </div>
                  <h3 className="text-xl font-serif text-primary-900 mb-1 group-hover:text-primary-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">by {book.authors?.display_name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{book.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {book.tags?.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};