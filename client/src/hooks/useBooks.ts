import { useState, useEffect } from 'react';
import { supabase } from '../api/client';
import { Book } from '../types/book';

export const useBooks = (authorId?: string) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, [authorId]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('books').select('*');
      
      if (authorId) {
        query = query.eq('author_id', authorId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  return { books, loading, error, refetch: fetchBooks };
};