import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../api/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StoryManager } from '../../components/author/StoryManager';
import { Analytics } from '../../components/author/Analytics';
import { StatsCard } from '../../components/author/StatsCard';

interface DashboardStats {
  stories: number;
  published: number;
  sparksReceived: number;
  totalReads: number;
  subscribers: number;
}

export const AuthorDashboard: React.FC = () => {
  const { user, isAuthor } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    stories: 0,
    published: 0,
    sparksReceived: 0,
    totalReads: 0,
    subscribers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    if (!isAuthor) {
      navigate('/');
      return;
    }
    fetchStats();
  }, [user, isAuthor]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch author's books
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select('id, status, total_reads, total_sparks')
        .eq('author_id', user.id);

      if (booksError) throw booksError;

      const publishedBooks = books?.filter(b => b.status === 'published') || [];
      const totalSparks = books?.reduce((sum, b) => sum + (b.total_sparks || 0), 0) || 0;
      const totalReads = books?.reduce((sum, b) => sum + (b.total_reads || 0), 0) || 0;

      setStats({
        stories: books?.length || 0,
        published: publishedBooks.length,
        sparksReceived: totalSparks,
        totalReads: totalReads,
        subscribers: 0, // Will be implemented with subscription system
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-serif text-primary-900">Author Studio</h1>
            <p className="text-gray-600 text-sm mt-1">
              Everything you write lives here as a draft until you publish it.
            </p>
          </div>
          <Link to="/story/new" className="btn-primary">
            + Start a new story
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatsCard 
            label="Stories" 
            value={stats.stories}
            icon="📚"
          />
          <StatsCard 
            label="Published" 
            value={stats.published}
            icon="📖"
          />
          <StatsCard 
            label="Sparks Received" 
            value={stats.sparksReceived}
            icon="✨"
          />
          <StatsCard 
            label="Total Reads" 
            value={stats.totalReads}
            icon="👀"
          />
          <StatsCard 
            label="Subscribers" 
            value={stats.subscribers}
            icon="⭐"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <StoryManager authorId={user?.id} />
          </div>
          <div>
            <Analytics authorId={user?.id} />
          </div>
        </div>
      </div>
    </div>
  );
};