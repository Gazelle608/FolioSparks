import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';

interface SparksWidgetProps {
  chapterId: string;
  authorName: string;
  onSendSparks: (amount: number) => void;
  userBalance: number;
}

const SPARK_AMOUNTS = [5, 10, 25, 50, 100];

export const SparksWidget: React.FC<SparksWidgetProps> = ({
  chapterId,
  authorName,
  onSendSparks,
  userBalance,
}) => {
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');

  const handleSend = () => {
    const amount = selectedAmount || parseInt(customAmount);
    if (!amount || amount <= 0) {
      alert('Please select or enter a Sparks amount');
      return;
    }
    if (amount > userBalance) {
      alert(`Insufficient Sparks balance. You have ${userBalance} Sparks.`);
      return;
    }
    onSendSparks(amount);
  };

  if (!user) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center">
        <p className="text-gray-600">Sign in to send Sparks to authors ✨</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-serif text-primary-900">✨ Send Sparks</h4>
        <span className="text-sm text-gray-500">Balance: {userBalance} Sparks</span>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Support {authorName} by sending Sparks to this chapter!
      </p>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {SPARK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => {
              setSelectedAmount(amount);
              setCustomAmount('');
            }}
            className={`py-2 rounded-lg font-semibold transition-all duration-200 ${
              selectedAmount === amount
                ? 'bg-primary-600 text-white'
                : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
            }`}
          >
            {amount}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <input
          type="number"
          placeholder="Custom amount"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            setSelectedAmount(null);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600"
          min="1"
        />
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowNote(!showNote)}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          {showNote ? 'Hide note' : 'Add a note (optional)'}
        </button>
        {showNote && (
          <textarea
            placeholder="Leave a message for the author..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600"
            rows={2}
          />
        )}
      </div>

      <button
        onClick={handleSend}
        disabled={!selectedAmount && !customAmount}
        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-primary-900 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send Sparks ✨
      </button>
    </div>
  );
};