import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../api/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface StoryFormData {
  title: string;
  genre: string;
  description: string;
  tags: string[];
  status: 'draft' | 'published';
  cover_url: string;
}

const GENRES = ['Fiction', 'Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Horror', 'Literary', 'Thriller'];

export const StoryEditor: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<StoryFormData>({
    title: '',
    genre: '',
    description: '',
    tags: [],
    status: 'draft',
    cover_url: '',
  });
  const [tagInput, setTagInput] = useState('');

  const isEditing = Boolean(storyId);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    if (isEditing) {
      fetchStory();
    } else {
      setLoading(false);
    }
  }, [user, storyId]);

  const fetchStory = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', storyId)
        .eq('author_id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          title: data.title || '',
          genre: data.genre?.[0] || '',
          description: data.description || '',
          tags: data.tags || [],
          status: data.status || 'draft',
          cover_url: data.cover_url || '',
        });
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      setError('Failed to load story');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      const bookData = {
        author_id: user.id,
        title: formData.title,
        description: formData.description,
        genre: [formData.genre],
        tags: formData.tags,
        status: formData.status,
        cover_url: formData.cover_url || null,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (isEditing) {
        result = await supabase
          .from('books')
          .update(bookData)
          .eq('id', storyId)
          .eq('author_id', user.id);
      } else {
        result = await supabase
          .from('books')
          .insert([{
            ...bookData,
            created_at: new Date().toISOString(),
          }])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      navigate(`/author/dashboard`);
    } catch (error) {
      console.error('Error saving story:', error);
      setError('Failed to save story. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
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
      <div className="container mx-auto max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-serif text-primary-900 mb-6">
            {isEditing ? 'Edit Story' : 'Start a new story'}
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="The Lantern Between Us"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600"
                required
              />
            </div>

            {/* Genre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Genre
              </label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600"
                required
              >
                <option value="">Select a genre</option>
                {GENRES.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Synopsis
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="A hook in two or three sentences..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600"
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' }))}
                  />
                  Draft
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'published' }))}
                  />
                  Publish Now
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/author/dashboard')}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Saving...
                  </>
                ) : (
                  isEditing ? 'Update Story' : 'Create Draft'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};