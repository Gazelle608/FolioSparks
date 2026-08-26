import React, { useState } from 'react';

interface DonationWidgetProps {
  authorName: string;
  platforms: {
    patreon?: string;
    ko_fi?: string;
    buymeacoffee?: string;
    paypal?: string;
    stripe?: string;
    other?: { name: string; url: string }[];
  };
}

const platformIcons: Record<string, string> = {
  patreon: '💰',
  ko_fi: '☕',
  buymeacoffee: '🧋',
  paypal: '💳',
  stripe: '💸',
};

export const DonationWidget: React.FC<DonationWidgetProps> = ({ authorName, platforms }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const availablePlatforms = Object.entries(platforms || {}).filter(([_, url]) => url);
  const hasDonations = availablePlatforms.length > 0;

  if (!hasDonations) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200"
      >
        ❤️ Support {authorName}
      </button>

      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl p-4 w-64 z-50 animate-slideUp">
          <p className="text-sm text-gray-600 mb-3">
            FolioSparks doesn't take any cut from these donations. 100% goes to the author!
          </p>
          <div className="space-y-2">
            {availablePlatforms.map(([platform, url]) => {
              const isCustom = platform === 'other';
              const displayName = isCustom 
                ? (platforms.other?.[0]?.name || 'Other')
                : platform.charAt(0).toUpperCase() + platform.slice(1);
              
              return (
                <a
                  key={platform}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
                >
                  <span className="text-xl">
                    {isCustom ? '🌟' : platformIcons[platform] || '💝'}
                  </span>
                  <span className="flex-1 font-medium text-primary-900 text-sm">
                    {displayName}
                  </span>
                  <span className="text-primary-600">→</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};