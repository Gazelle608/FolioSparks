import React from 'react';
import { Link } from 'react-router-dom';

export const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-green text-white py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <h1 className="text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
              Stories worth staying up for.
              <br />
              <span className="text-accent-300">Authors who actually get paid.</span>
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl">
              FolioSparks is a digital library for serialized novels. Readers spend Sparks 
              on the chapters that hit hardest, vote on what happens next, and donate straight 
              to the author's own Ko-fi or Patreon.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="bg-white text-primary-900 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-300 hover:scale-105">
                Start Reading Free
              </Link>
              <Link to="/library" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300">
                Explore Library
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-md aspect-square bg-gradient-light rounded-2xl flex items-center justify-center text-6xl animate-float">
              📚
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};