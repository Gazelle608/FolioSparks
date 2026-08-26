import React from 'react';

const features = [
  {
    number: '01',
    title: 'Pick your payout',
    description: 'At sign-up an author names their donation platform. That link lives on every chapter they publish.',
    icon: '💳',
  },
  {
    number: '02',
    title: 'Readers spend Sparks',
    description: 'Members get a monthly Sparks allowance. Sparks land on chapters, not vague profiles.',
    icon: '⚡',
  },
  {
    number: '03',
    title: 'Readers steer the plot',
    description: 'Chapter polls and open desks turn a serial into something the audience helped build.',
    icon: '🗳️',
  },
];

export const FeatureGrid: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl font-serif text-primary-900 text-center mb-4">
          What you can't do on the other read:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {features.map((feature) => (
            <div key={feature.number} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <div className="text-sm text-primary-600 font-semibold mb-2">{feature.number}</div>
              <h3 className="text-xl font-serif text-primary-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};