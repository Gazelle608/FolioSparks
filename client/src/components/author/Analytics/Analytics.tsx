import React, { useEffect, useState } from 'react';
import { supabase } from '../../../api/client';

interface AnalyticsProps {
  authorId: string;
}

interface AnalyticsData {
  totalReads: number;
  totalSparks: number;
  chaptersPublished: number;
  readerEngagement: number;
}

export const Analytics: React.FC<AnalyticsProps> = ({ authorId }) => {
  const [data, setData] = useState<AnalyticsData>({
    totalReads: 0,
    totalSparks: 0,
    chaptersPublished: 0,
    readerEngagement: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authorId) {
      fetchAnalytics();
    }
  }, [authorId]);

  const fetchAnalytics = async () => {
    try {
      // Fetch books
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select('total_reads, total_sparks')
        .eq('author_id', authorId);

      if (booksError) throw booksError;

      // Fetch chapters
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('id')
        .eq('author_id', authorId)
        .eq('is_published', true);

      if (chaptersError) throw chaptersError;

      const totalReads = books?.reduce((sum, b) => sum + (b.total_reads || 0), 0) || 0;
      const totalSparks = books?.reduce((sum, b) => sum + (b.total_sparks || 0), 0) || 0;

      setData({
        totalReads,
        totalSparks,
        chaptersPublished: chapters?.length || 0,
        readerEngagement: totalReads > 0 ? Math.round((totalSparks / totalReads) * 100) : 0,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading analytics...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-serif text-primary-900 mb-4">Analytics</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Total Reads</p>
          <p className="text-2xl font-bold text-primary-900">{data.totalReads.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Sparks</p>
          <p className="text-2xl font-bold text-spark-500">{data.totalSparks.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Chapters Published</p>
          <p className="text-2xl font-bold text-primary-900">{data.chaptersPublished}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Reader Engagement</p>
          <p className="text-2xl font-bold text-primary-900">{data.readerEngagement}%</p>
        </div>
      </div>
    </div>
  );
};