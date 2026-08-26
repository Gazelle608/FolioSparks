import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { supabase } from '../api/client';

export const useSparks = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user]);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_sparks')
        .select('balance')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setBalance(data?.balance || 0);
    } catch (error) {
      console.error('Error fetching Sparks balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = async () => {
    await fetchBalance();
  };

  return { balance, loading, refreshBalance };
};