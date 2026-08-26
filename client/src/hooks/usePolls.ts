import { useState, useEffect } from 'react';
import { supabase } from '../api/client';
import { Poll } from '../types/poll';

export const usePolls = (bookId?: string) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookId) {
      fetchPolls();
    }
  }, [bookId]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      let query = supabase.from('polls').select('*').eq('is_active', true);
      
      if (bookId) {
        query = query.eq('book_id', bookId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPolls(data || []);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  return { polls, loading, refetch: fetchPolls };
};