import React from 'react';
import { Link } from 'react-router-dom';
import { IconMembership, IconSparks, IconAudio, IconAnalytics, IconCrown, IconArrowRight } from '../../../types/icons';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';

export const MembershipCTA: React.FC = () => {
  const benefits = [
    { icon: IconSparks, text: 'Sparks allowance to support authors', color: '#F4A460' },
    { icon: IconAudio, text: 'Audio mode with offline chapters', color: '#235347' },
    { icon: IconAnalytics, text: 'Chapter-level analytics for authors', color: '#235347' },
    { icon: IconCrown, text: 'Featured placement in the library', color: '#F4A460' },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-green text-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-700/50 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <IconMembership size={18} color="#DAF1DE" />
            <span className="text-sm text-primary-200">Membership</span>
          </div>
          <h2 className="text-4xl font-serif mb-4">
            Membership funds the shelf
          </h2>
          <p className="text-primary-200 max-w-2xl mx-auto">
            Free readers get a small monthly Sparks allowance. Spark and Spark Pro members get
            a much larger allowance, offline audio, early chapters and analytics for their own
            serials — and most of that money ends up in an author's hands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {benefits.map((benefit, index) => (
            <Card key={index} variant="outlined" className="bg-primary-800/30 border-primary-700 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary-700/50 rounded-xl flex items-center justify-center mb-3">
                  <benefit.icon size={28} color={benefit.color} />
                </div>
                <p className="text-sm text-primary-200">{benefit.text}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/membership">
            <Button size="lg" className="bg-white text-primary-900 hover:bg-primary-50">
              See membership tiers
              <IconArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};