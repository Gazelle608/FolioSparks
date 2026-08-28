import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-900 text-primary-200 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-serif text-white">FolioSparks</h3>
            <p className="text-sm text-primary-300">
              Serialized fiction that pays its authors directly.
            </p>
          </div>
          
          <div className="flex gap-6">
            <Link to="/library" className="hover:text-white transition-colors">
              Library
            </Link>
            <Link to="/membership" className="hover:text-white transition-colors">
              Membership
            </Link>
            <Link to="/about" className="hover:text-white transition-colors">
              About
            </Link>
          </div>
          
          <div className="text-sm text-primary-400">
            © {new Date().getFullYear()} FolioSparks. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};