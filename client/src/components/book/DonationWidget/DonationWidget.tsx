import React, { useState } from 'react';
import { IconDonation, IconArrowRight, IconClose } from '../../../types/icons';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';

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
  const availablePlatforms = Object.entries(platforms).filter(([_, url]) => url);
  const hasDonations = availablePlatforms.length > 0;

  if (!hasDonations) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 hover:scale-110 hover:shadow-xl"
        aria-label="Support author"
      >
        <IconDonation size={28} color="white" />
      </button>

      {/* Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/50 backdrop-blur-sm animate-fadeIn">
          <Card className="max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <IconDonation size={28} color="#235347" />
                <h3 className="text-xl font-serif text-primary-900">
                  Support {authorName}
                </h3>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <IconClose size={20} color="#163832" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              FolioSparks doesn't take any cut from these donations. 100% goes to the author!
            </p>

            <div className="space-y-3">
              {availablePlatforms.map(([platform, url]) => {
                const isCustom = platform === 'other';
                const displayName = isCustom
                  ? (platforms.other?.[0]?.name || 'Other')
                  : platform.charAt(0).toUpperCase() + platform.slice(1);
                const icon = isCustom ? '🌟' : platformIcons[platform] || '💝';

                return (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-primary-200 hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 group"
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="flex-1 font-medium text-primary-900">{displayName}</span>
                    <IconArrowRight
                      size={20}
                      color="#235347"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </a>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-primary-100">
              <p className="text-xs text-gray-500 text-center">
                These links go directly to {authorName}'s donation pages
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};