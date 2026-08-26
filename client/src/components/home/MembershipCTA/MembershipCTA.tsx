import React from 'react';
import { Link } from 'react-router-dom';

export const MembershipCTA: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gradient-green text-white">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-serif font-bold mb-6">
          Membership funds the shelf
        </h2>
        <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
          Free readers get a small monthly Sparks allowance. Spark and Spark Pro members get a much larger 
          allowance, offline audio, early chapters and analytics for their own serials — and most of that 
          money ends up in an author's hands.
        </p>
        <Link to="/membership" className="inline-block bg-white text-primary-900 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-300 hover:scale-105">
          See Membership Tiers →
        </Link>
      </div>
    </section>
  );
};