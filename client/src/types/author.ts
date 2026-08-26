export interface Author {
  id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  donation_platforms: {
    patreon?: string;
    ko_fi?: string;
    buymeacoffee?: string;
    paypal?: string;
    stripe?: string;
    other?: { name: string; url: string }[];
  };
  subscription_revenue_split: number;
  total_reads: number;
  created_at: string;
  updated_at: string;
}