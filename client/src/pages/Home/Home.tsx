import React from 'react';
import { Hero } from '../../components/home/Hero';
import { FeatureGrid } from '../../components/home/FeatureGrid';
import { BurningNow } from '../../components/home/BurningNow';
import { MembershipCTA } from '../../components/home/MembershipCTA';
import styles from './Home.module.css';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-50">
      <Hero />
      <FeatureGrid />
      <BurningNow />
      <MembershipCTA />
      
      {/* Footer is handled by Layout component */}
    </div>
  );
};