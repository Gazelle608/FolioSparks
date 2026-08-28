import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user, isAuthor, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-green text-white py-4 px-4 shadow-lg">
      <div className="container mx-auto max-w-7xl flex items-center justify-between">
        <Link to="/" className="text-2xl font-serif font-bold hover:text-primary-200 transition-colors">
          FolioSparks
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/library" className="hover:text-primary-200 transition-colors">
            Library
          </Link>
          <Link to="/membership" className="hover:text-primary-200 transition-colors">
            Membership
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              {isAuthor && (
                <Link to="/author/dashboard" className="hover:text-primary-200 transition-colors">
                  Dashboard
                </Link>
              )}
              <Link to="/profile" className="hover:text-primary-200 transition-colors">
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/signin" className="hover:text-primary-200 transition-colors">
                Sign In
              </Link>
              <Link to="/signup" className="bg-white text-primary-900 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                Start Writing
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};