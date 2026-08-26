import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../api/client';
import { AuthContext } from './AuthContext';

interface SparksContextType {
  balance: number;
  loading: boolean;
  refreshBalance: () => Promise<void>;
}

export const SparksContext = createContext<SparksContextType | undefined>(undefined);

export const SparksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useContext(AuthContext)!;
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

  return (
    <SparksContext.Provider value={{ balance, loading, refreshBalance }}>
      {children}
    </SparksContext.Provider>
  );
};