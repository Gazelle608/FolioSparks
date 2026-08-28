import React, { useState } from 'react';
import { Poll } from '../../../types/poll';

interface PollWidgetProps {
  poll: Poll;
  onVote: (optionId: string) => void;
}

export const PollWidget: React.FC<PollWidgetProps> = ({ poll, onVote }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = () => {
    if (selectedOption && !hasVoted) {
      onVote(selectedOption);
      setHasVoted(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h4 className="font-serif text-primary-900 text-lg mb-2">{poll.question}</h4>
      <p className="text-sm text-gray-500 mb-4">{poll.description}</p>
      
      <div className="space-y-2 mb-4">
        {poll.options?.map((option: { id: string; text: string; votes: number }) => (
          <label
            key={option.id}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedOption === option.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            } ${hasVoted ? 'opacity-75 cursor-default' : ''}`}
          >
            <input
              type="radio"
              name={`poll-${poll.id}`}
              value={option.id}
              checked={selectedOption === option.id}
              onChange={() => !hasVoted && setSelectedOption(option.id)}
              disabled={hasVoted}
              className="text-primary-600"
            />
            <span className="flex-1 text-gray-700">{option.text}</span>
            {hasVoted && option.votes && (
              <span className="text-sm text-gray-400">
                {poll.total_votes > 0 ? Math.round((option.votes / poll.total_votes) * 100) : 0}%
              </span>
            )}
          </label>
        ))}
      </div>

      {!hasVoted ? (
        <button
          onClick={handleVote}
          disabled={!selectedOption}
          className="w-full py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Vote
        </button>
      ) : (
        <div className="text-center text-sm text-gray-500">
          ✅ Thanks for voting!
        </div>
      )}
    </div>
  );
};