import React from 'react';
import { LoadingSpinner } from '../../common/LoadingSpinner/LoadingSpinner';

interface PricingCardProps {
  plan: {
    id: string;
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    cta: string;
    popular: boolean;
  };
  onSelect: (planId: string) => void;
  isLoading: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, onSelect, isLoading }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
      plan.popular ? 'border-2 border-primary-600 relative' : ''
    }`}>
      {plan.popular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="bg-primary-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-serif text-primary-900">{plan.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
        
        <div className="mt-4 mb-6">
          <span className="text-4xl font-bold text-primary-900">{plan.price}</span>
          <span className="text-gray-500">{plan.period}</span>
        </div>

        <ul className="space-y-2 mb-6">
          {plan.features.map((feature: string, index: number) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="text-primary-600 mt-1">✓</span>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => onSelect(plan.id)}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
            plan.popular
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              Processing...
            </span>
          ) : (
            plan.cta
          )}
        </button>
      </div>
    </div>
  );
};