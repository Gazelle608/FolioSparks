import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../api/client';
import { Book } from '../../../types/book';

interface StoryManagerProps {
  authorId: string;
}

export const StoryManager: React.FC<StoryManagerProps> = ({ authorId }) => {
  const [stories, setStories] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authorId) {
      fetchStories();
    }
  }, [authorId]);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading stories...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-serif text-primary-900">Your Stories</h2>
        <Link to="/story/new" className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
          + New Story
        </Link>
      </div>

      {stories.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <p className="text-gray-500">No stories yet — create your first draft above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <Link
              key={story.id}
              to={`/story/${story.id}`}
              className="block bg-white rounded-lg p-4 hover:shadow-md transition-all duration-200 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-primary-900">{story.title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      story.status === 'published' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {story.status || 'draft'}
                    </span>
                    <span className="text-xs text-gray-400">{story.total_reads || 0} reads</span>
                    <span className="text-xs text-gray-400">⭐ {story.total_sparks || 0}</span>
                  </div>
                </div>
                <span className="text-primary-600">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};