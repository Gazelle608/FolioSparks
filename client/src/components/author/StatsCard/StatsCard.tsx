import React from 'react';

interface StatsCardProps {
  label: string;
  value: number;
  icon: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all duration-300">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-primary-900">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
};