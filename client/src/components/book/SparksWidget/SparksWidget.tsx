import React, { useState } from 'react';
import { IconSparks, IconHeart, IconClose } from '../../../types/icons';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
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
      <Card className="text-center py-6">
        <IconSparks size={32} color="#8EB69B" className="mx-auto mb-3" />
        <p className="text-gray-600">Sign in to send Sparks to authors</p>
        <Button variant="primary" size="sm" className="mt-3">
          Sign In
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IconSparks size={24} color="#F4A460" />
          <h4 className="font-serif text-primary-900">Send Sparks</h4>
        </div>
        <span className="text-sm text-gray-500">
          Balance: <span className="font-semibold text-spark-dark">{userBalance}</span>
        </span>
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
            className={`
              py-2 rounded-lg font-semibold transition-all duration-200
              ${selectedAmount === amount
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
              }
            `}
          >
            {amount}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <Input
          type="number"
          placeholder="Custom amount"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            setSelectedAmount(null);
          }}
          min="1"
        />
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowNote(!showNote)}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          {showNote ? 'Hide note' : 'Add a note (optional)'}
          <IconHeart size={14} color="#235347" />
        </button>
        {showNote && (
          <textarea
            placeholder="Leave a message for the author..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full mt-2 px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={2}
          />
        )}
      </div>

      <Button
        onClick={handleSend}
        disabled={!selectedAmount && !customAmount}
        fullWidth
        className="bg-spark-gradient text-primary-900 hover:shadow-lg"
      >
        <IconSparks size={18} className="mr-2" />
        Send Sparks
      </Button>
    </Card>
  );
};