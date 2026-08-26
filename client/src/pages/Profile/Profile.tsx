import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { User, Author } from '../../types';

export const Profile: React.FC = () => {
  const { user, isAuthor } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [authorData, setAuthorData] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    donation_platforms: {} as Record<string, string>,
  });

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;
      setProfile(userData);

      // If author, get author data
      if (isAuthor) {
        const { data: authorData, error: authorError } = await supabase
          .from('authors')
          .select('*')
          .eq('id', user?.id)
          .single();

        if (authorError) throw authorError;
        setAuthorData(authorData);
        setFormData({
          display_name: authorData.display_name || '',
          bio: authorData.bio || '',
          donation_platforms: authorData.donation_platforms || {},
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      if (isAuthor) {
        const { error } = await supabase
          .from('authors')
          .update({
            display_name: formData.display_name,
            bio: formData.bio,
            donation_platforms: formData.donation_platforms,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) throw error;
      }

      setEditing(false);
      await fetchProfile(); // Refresh data
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile');
    } finally {
      setSaving(false);
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
      <div className="container mx-auto max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-serif text-primary-900">Profile</h1>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-light flex items-center justify-center text-3xl">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  '👤'
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-primary-900">{user?.email}</p>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600"
                />
              ) : (
                <p className="text-lg text-primary-900">{authorData?.display_name || user?.email}</p>
              )}
            </div>

            {/* Bio */}
            {isAuthor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                {editing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600"
                    placeholder="Tell readers about yourself..."
                  />
                ) : (
                  <p className="text-gray-600">{authorData?.bio || 'No bio yet'}</p>
                )}
              </div>
            )}

            {/* Donation Platforms (Author only) */}
            {isAuthor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Donation Platforms
                </label>
                {editing ? (
                  <div className="space-y-2">
                    {['patreon', 'ko-fi', 'buymeacoffee', 'paypal', 'stripe'].map((platform) => (
                      <div key={platform} className="flex items-center gap-2">
                        <span className="w-24 text-sm text-gray-600 capitalize">
                          {platform}:
                        </span>
                        <input
                          type="url"
                          value={formData.donation_platforms[platform] || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            donation_platforms: {
                              ...prev.donation_platforms,
                              [platform]: e.target.value,
                            }
                          }))}
                          placeholder={`https://${platform}.com/your-profile`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(authorData?.donation_platforms || {}).map(([platform, url]) => (
                      url && (
                        <div key={platform} className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 capitalize">{platform}:</span>
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline text-sm"
                          >
                            {url}
                          </a>
                        </div>
                      )
                    ))}
                    {Object.keys(authorData?.donation_platforms || {}).length === 0 && (
                      <p className="text-gray-400 text-sm">No donation platforms set up</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Member Since */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Member since {new Date(user?.created_at || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};