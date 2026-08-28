// Export all type definitions
export * from './user';
export * from './author';
export * from './book';
export * from './chapter';
export * from './sparks';
export * from './poll';
export * from './coWriting';
export * from './subscription';
export * from './icons';

// Common utility types
export type ID = string;
export type Timestamp = string;
export type Status = 'active' | 'inactive' | 'pending' | 'archived' | 'deleted';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in';
  value: any;
}

// Re-export commonly used types for convenience
export type { User, UserPreferences, NotificationSettings, UserSession } from './user';
export type { 
  Author, 
  DonationPlatforms, 
  CustomPlatform, 
  SocialLinks, 
  AuthorStats, 
  AuthorActivity 
} from './author';
export type { 
  Book, 
  BookFilters, 
  BookStats, 
  Genre, 
  GENRES 
} from './book';
export type { 
  Chapter, 
  ChapterStats, 
  ChapterComment, 
  ReadingProgress 
} from './chapter';
export type { 
  SparksTransaction, 
  SparksBalance, 
  SparksAllotment, 
  SPARKS_ALLOTMENTS 
} from './sparks';
export type { 
  Poll, 
  PollOption, 
  PollVote, 
  PollResult, 
  PollType, 
  POLL_TYPES 
} from './poll';
export type { 
  CoWritingInvite, 
  CoWritingContribution, 
  CoWritingCollaboration, 
  CoWritingPermission 
} from './coWriting';
export type { 
  Subscription, 
  SubscriptionPlan, 
  SubscriptionBenefits, 
  SUBSCRIPTION_BENEFITS 
} from './subscription';
export type { IconProps } from './icons';