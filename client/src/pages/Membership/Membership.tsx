import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { PricingCard } from '../../components/membership/PricingCard';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Everything you need to read',
    features: [
      'Full library access',
      '100 Sparks a month',
      'Bookshelf and reading progress',
      'Vote in chapter polls',
    ],
    cta: 'Create an account',
    popular: false,
  },
  {
    id: 'spark',
    name: 'Spark',
    price: '$5',
    period: '/month',
    description: 'For readers who want more',
    features: [
      '1,200 Sparks a month',
      'Audio mode with offline chapters',
      'Early access chapters from your authors',
      'Supporter badge on comments and tips',
    ],
    cta: 'Choose Spark',
    popular: true,
  },
  {
    id: 'spark-pro',
    name: 'Spark Pro',
    price: '$12',
    period: '/month',
    description: 'For authors and super readers',
    features: [
      '3,000 Sparks a month',
      'Chapter-level Sparks analytics',
      'Unlimited polls and co-writing desks',
      'Featured placement in the library',
    ],
    cta: 'Choose Spark Pro',
    popular: false,
  },
];

export const Membership: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    setSelectedPlan(planId);
    setLoading(true);

    try {
      // In a real implementation, this would redirect to Stripe checkout
      // For now, we'll simulate the flow
      console.log('Selected plan:', planId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`✨ You've selected the ${planId} plan! (Demo: Payment integration coming soon)`);
    } catch (error) {
      console.error('Error selecting plan:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-primary-900 mb-4">Membership</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Sparks are how readers pay authors here. Membership tops up your Sparks and unlocks 
            the tools that make a serial easier to run.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSelect={handleSelectPlan}
              isLoading={loading && selectedPlan === plan.id}
            />
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Paid tiers are not billing yet — checkout gets wired up next. Author donations 
            already run through each author's own platform link.
          </p>
        </div>
      </div>
    </div>
  );
};