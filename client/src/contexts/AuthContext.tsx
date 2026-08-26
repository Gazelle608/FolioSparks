import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../api/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthor: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkIsAuthor(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkIsAuthor(session.user.id);
        } else {
          setIsAuthor(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkIsAuthor = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('authors')
        .select('id')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsAuthor(!!data);
    } catch (error) {
      console.error('Error checking author status:', error);
      setIsAuthor(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthor, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};