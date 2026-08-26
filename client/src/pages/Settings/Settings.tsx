import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    email_notifications: true,
    reading_notifications: true,
    marketing_emails: false,
    dark_mode: false,
    font_size: 'medium',
    reading_progress: true,
  });

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // In a real implementation, fetch from Supabase
      // For now, we'll use default settings
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real implementation, save to Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!confirm('All your data including books, chapters, and Sparks will be permanently deleted.')) {
      return;
    }

    try {
      setLoading(true);
      // In a real implementation, delete from Supabase
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sign out and redirect
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account. Please try again.');
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
      <div className="container mx-auto max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-serif text-primary-900 mb-6">Settings</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <div className="space-y-8">
            {/* Preferences */}
            <div>
              <h2 className="text-xl font-serif text-primary-900 mb-4">Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive email updates about new chapters</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      email_notifications: !prev.email_notifications
                    }))}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${
                      settings.email_notifications ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all duration-300 transform ${
                      settings.email_notifications ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">Reading Progress Sync</p>
                    <p className="text-sm text-gray-500">Sync reading progress across devices</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      reading_progress: !prev.reading_progress
                    }))}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${
                      settings.reading_progress ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all duration-300 transform ${
                      settings.reading_progress ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">Dark Mode</p>
                    <p className="text-sm text-gray-500">Use dark theme for reading</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      dark_mode: !prev.dark_mode
                    }))}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${
                      settings.dark_mode ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all duration-300 transform ${
                      settings.dark_mode ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Reading Preferences */}
            <div>
              <h2 className="text-xl font-serif text-primary-900 mb-4">Reading</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Size
                  </label>
                  <select
                    value={settings.font_size}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      font_size: e.target.value as 'small' | 'medium' | 'large'
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border-t border-red-200 pt-6">
              <h2 className="text-xl font-serif text-red-600 mb-4">Danger Zone</h2>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-red-700 text-sm mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center justify-center gap-2 w-full"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};