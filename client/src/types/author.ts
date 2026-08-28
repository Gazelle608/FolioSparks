import { User } from './user';
import { IconProps } from './icons';

export interface Author extends User {
  bio: string;
  website?: string;
  donation_platforms: DonationPlatforms;
  subscription_revenue_split: number;
  total_reads: number;
  total_sparks: number;
  is_verified: boolean;
  social_links: SocialLinks;
}

export interface DonationPlatforms {
  patreon?: string;
  ko_fi?: string;
  buymeacoffee?: string;
  paypal?: string;
  stripe?: string;
  other?: CustomPlatform[];
}

export interface CustomPlatform {
  name: string;
  url: string;
  icon?: React.FC<IconProps>;
}

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  tiktok?: string;
  youtube?: string;
}

export interface AuthorStats {
  totalBooks: number;
  totalChapters: number;
  totalSparks: number;
  totalReads: number;
  totalSubscribers: number;
  recentActivity: AuthorActivity[];
}

export interface AuthorActivity {
  id: string;
  type: 'book_published' | 'chapter_published' | 'poll_created' | 'sparks_received';
  description: string;
  timestamp: string;
  metadata: Record<string, any>;
}