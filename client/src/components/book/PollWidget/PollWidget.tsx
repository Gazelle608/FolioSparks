import React, { useState } from 'react';
import { IconPoll, IconCheck, IconVote } from '../../../types/icons';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Poll } from '../../../types/poll';
import { useAuth } from '../../../hooks/useAuth';

interface PollWidgetProps {
  poll: Poll;
  onVote: (optionId: string) => void;
}

export const PollWidget: React.FC<PollWidgetProps> = ({ poll, onVote }) => {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);

  const handleVote = () => {
    if (!selectedOption) return;
    onVote(selectedOption);
    setVoted(true);
  };

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <IconPoll size={24} color="#235347" className="flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-serif text-primary-900">{poll.title}</h4>
          {poll.description && (
            <p className="text-sm text-gray-600">{poll.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const isSelected = selectedOption === option.id;

          return (
            <button
              key={option.id}
              onClick={() => !voted && setSelectedOption(option.id)}
              disabled={voted}
              className={`
                w-full text-left p-3 rounded-lg border-2 transition-all duration-200 relative
                ${voted ? 'cursor-default' : 'cursor-pointer hover:bg-primary-50'}
                ${isSelected ? 'border-primary-600 bg-primary-50' : 'border-primary-200'}
                ${voted && option.id === poll.options.find(o => o.id === selectedOption)?.id ? 'border-primary-600' : ''}
              `}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-primary-900">
                    {option.text}
                  </span>
                  {voted && option.id === selectedOption && (
                    <IconCheck size={16} color="#235347" />
                  )}
                </div>
                {voted && (
                  <span className="text-sm font-semibold text-primary-600">
                    {percentage.toFixed(1)}%
                  </span>
                )}
              </div>
              {voted && (
                <div
                  className="absolute inset-0 bg-primary-100 rounded-lg opacity-30"
                  style={{ width: `${percentage}%` }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-primary-100">
        <span className="text-sm text-gray-500">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </span>
        {!voted && user ? (
          <Button
            onClick={handleVote}
            disabled={!selectedOption}
            size="sm"
            icon={IconVote}
          >
            Vote
          </Button>
        ) : !user ? (
          <Button variant="secondary" size="sm">
            Sign in to vote
          </Button>
        ) : (
          <span className="text-sm text-primary-600 flex items-center gap-1">
            <IconCheck size={16} color="#235347" />
            Voted
          </span>
        )}
      </div>
    </Card>
  );
};