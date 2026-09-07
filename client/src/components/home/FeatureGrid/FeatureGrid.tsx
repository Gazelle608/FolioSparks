import React from 'react';
import { IconDonation, IconSparks, IconPoll } from '../../../types/icons';
import { Card } from '../../common/Card';

const features = [
  {
    id: 'payout',
    number: '01',
    title: 'Pick your payout',
    description: 'At sign-up an author names their donation platform. That link lives on every chapter they publish.',
    icon: IconDonation,
    color: '#235347',
  },
  {
    id: 'sparks',
    number: '02',
    title: 'Readers spend Sparks',
    description: 'Members get a monthly Sparks allowance. Sparks land on chapters, not vague profiles.',
    icon: IconSparks,
    color: '#F4A460',
  },
  {
    id: 'polls',
    number: '03',
    title: 'Readers steer the plot',
    description: 'Chapter polls and open desks turn a serial into something the audience helped build.',
    icon: IconPoll,
    color: '#235347',
  },
];

export const FeatureGrid: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-primary-900 mb-4">
            What you can't do on the other read:
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            FolioSparks puts authors and readers in control of the story
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.id} hoverable>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                  <feature.icon size={28} color={feature.color} />
                </div>
                <div>
                  <div className="text-sm text-primary-600 font-semibold mb-1">{feature.number}</div>
                  <h3 className="text-xl font-serif text-primary-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};