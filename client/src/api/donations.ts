import { supabase } from './client';
import { DonationPlatforms } from './authors';

export interface DonationLink {
  platform: string;
  url: string;
  icon: string;
  description: string;
}

export const donations = {
  // Get donation links for an author
  getAuthorDonationLinks: async (authorId: string): Promise<{ 
    data: DonationLink[] | null; 
    error: Error | null 
  }> => {
    try {
      const { data, error } = await supabase
        .from('authors')
        .select('donation_platforms')
        .eq('id', authorId)
        .single();

      if (error) throw error;

      const platforms = data?.donation_platforms || {};
      const links: DonationLink[] = [];

      const platformConfig: Record<string, { icon: string; description: string }> = {
        patreon: { icon: '💰', description: 'Monthly subscriptions' },
        ko_fi: { icon: '☕', description: 'Tips & commissions' },
        buymeacoffee: { icon: '🧋', description: 'One-time support' },
        paypal: { icon: '💳', description: 'Direct payments' },
        stripe: { icon: '💸', description: 'Payment processing' },
      };

      // Add configured platforms
      Object.entries(platforms).forEach(([key, url]) => {
        if (key !== 'other' && url && typeof url === 'string') {
          const config = platformConfig[key];
          links.push({
            platform: key.charAt(0).toUpperCase() + key.slice(1),
            url,
            icon: config?.icon || '💝',
            description: config?.description || 'Support on this platform',
          });
        }
      });

      // Add custom platforms
      if (platforms.other && Array.isArray(platforms.other)) {
        platforms.other.forEach((other: { name: string; url: string }) => {
          links.push({
            platform: other.name,
            url: other.url,
            icon: '🌟',
            description: 'Support on this platform',
          });
        });
      }

      return { data: links, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Track donation link click (for analytics)
  trackDonationClick: async (authorId: string, platform: string): Promise<{ error: Error | null }> => {
    try {
      // You could store this in an analytics table
      const { error } = await supabase
        .from('donation_clicks')
        .insert([{
          author_id: authorId,
          platform,
          clicked_at: new Date().toISOString(),
        }]);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      // Log error but don't block the user
      console.error('Failed to track donation click:', error);
      return { error: error as Error };
    }
  },

  // Get donation statistics for an author
  getDonationStats: async (authorId: string): Promise<{ 
    data: {
      total_clicks: number;
      platforms: Record<string, number>;
      top_platform: string | null;
    } | null; 
    error: Error | null 
  }> => {
    try {
      const { data, error } = await supabase
        .from('donation_clicks')
        .select('platform')
        .eq('author_id', authorId);

      if (error) throw error;

      const platformClicks: Record<string, number> = {};
      data?.forEach(click => {
        platformClicks[click.platform] = (platformClicks[click.platform] || 0) + 1;
      });

      const totalClicks = data?.length || 0;
      const topPlatform = Object.entries(platformClicks)
        .sort(([, a], [, b]) => b - a)
        .map(([platform]) => platform)[0] || null;

      return {
        data: {
          total_clicks: totalClicks,
          platforms: platformClicks,
          top_platform: topPlatform,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
};