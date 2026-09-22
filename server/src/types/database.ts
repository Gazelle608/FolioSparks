// ============================================================
// Supabase Database Types (server copy)
//
// Auto-generated. Regenerate from the live Supabase project with
//   npm --workspace server run db:types
// Mirrors client/src/types/database.ts — keep the two in sync.
// Do not edit by hand — your changes will be overwritten.
//
// Generator: `supabase gen types typescript --linked`
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// Postgres enums
// ---------------------------------------------------------------------------
export type StoryStatus = 'draft' | 'ongoing' | 'hiatus' | 'completed' | 'cancelled';
export type PublishMode = 'full_manuscript' | 'chapter_by_chapter';
export type ContentRating = 'general' | 'teen' | 'mature';
export type SparkReason =
  | 'signup_bonus'
  | 'monthly_grant'
  | 'chapter_spark'
  | 'poll_reward'
  | 'admin_adjustment'
  | 'referral_bonus';
export type PollStatus = 'open' | 'closed' | 'cancelled';
export type DeskRole = 'owner' | 'cowriter' | 'reader';
export type DeskStatus = 'open' | 'closed';
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'revoked';
export type MembershipTier = 'free' | 'spark' | 'spark_pro';
export type MembershipStatus = 'active' | 'past_due' | 'cancelled' | 'trialing';
export type DonationPlatform =
  | 'patreon'
  | 'ko_fi'
  | 'buymeacoffee'
  | 'paypal'
  | 'stripe'
  | 'cashapp'
  | 'venmo'
  | 'custom';
export type AudioStatus = 'pending' | 'generating' | 'ready' | 'failed';

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          is_author: boolean;
          onboarded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          is_author?: boolean;
          onboarded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          is_author?: boolean;
          onboarded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      authors: {
        Row: {
          id: string;
          pen_name: string | null;
          tagline: string | null;
          total_sparks_received: number;
          total_reads: number;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          pen_name?: string | null;
          tagline?: string | null;
          total_sparks_received?: number;
          total_reads?: number;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          pen_name?: string | null;
          tagline?: string | null;
          total_sparks_received?: number;
          total_reads?: number;
          is_verified?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      stories: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          slug: string;
          synopsis: string | null;
          cover_url: string | null;
          genre: string;
          tags: string[];
          content_rating: ContentRating;
          language: string;
          status: StoryStatus;
          publish_mode: PublishMode;
          allows_polls: boolean;
          allows_sparks: boolean;
          is_open_desk: boolean;
          is_donation_enabled: boolean;
          chapter_count: number;
          word_count: number;
          read_count: number;
          spark_count: number;
          follower_count: number;
          published_at: string | null;
          last_chapter_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          slug: string;
          synopsis?: string | null;
          cover_url?: string | null;
          genre: string;
          tags?: string[];
          content_rating?: ContentRating;
          language?: string;
          status?: StoryStatus;
          publish_mode?: PublishMode;
          allows_polls?: boolean;
          allows_sparks?: boolean;
          is_open_desk?: boolean;
          is_donation_enabled?: boolean;
          published_at?: string | null;
        };
        Update: {
          title?: string;
          slug?: string;
          synopsis?: string | null;
          cover_url?: string | null;
          genre?: string;
          tags?: string[];
          content_rating?: ContentRating;
          language?: string;
          status?: StoryStatus;
          publish_mode?: PublishMode;
          allows_polls?: boolean;
          allows_sparks?: boolean;
          is_open_desk?: boolean;
          is_donation_enabled?: boolean;
          published_at?: string | null;
          read_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };

      chapters: {
        Row: {
          id: string;
          story_id: string;
          author_id: string;
          chapter_number: number;
          title: string | null;
          content: string;
          word_count: number;
          is_published: boolean;
          published_at: string | null;
          scheduled_for: string | null;
          read_count: number;
          spark_count: number;
          comment_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          author_id: string;
          chapter_number: number;
          title?: string | null;
          content: string;
          is_published?: boolean;
          published_at?: string | null;
          scheduled_for?: string | null;
        };
        Update: {
          title?: string | null;
          content?: string;
          is_published?: boolean;
          published_at?: string | null;
          scheduled_for?: string | null;
          read_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };

      spark_ledger: {
        Row: {
          id: string;
          user_id: string;
          delta: number;
          reason: SparkReason;
          chapter_id: string | null;
          story_id: string | null;
          author_id: string | null;
          note: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          delta: number;
          reason: SparkReason;
          chapter_id?: string | null;
          story_id?: string | null;
          author_id?: string | null;
          note?: string | null;
          metadata?: Json;
        };
        Update: never; // ledger is immutable
        Relationships: [];
      };

      polls: {
        Row: {
          id: string;
          story_id: string;
          author_id: string;
          chapter_id: string | null;
          question: string;
          description: string | null;
          status: PollStatus;
          closes_at: string | null;
          winning_option_id: string | null;
          total_votes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          author_id: string;
          chapter_id?: string | null;
          question: string;
          description?: string | null;
          status?: PollStatus;
          closes_at?: string | null;
        };
        Update: {
          question?: string;
          description?: string | null;
          status?: PollStatus;
          closes_at?: string | null;
          winning_option_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      poll_options: {
        Row: {
          id: string;
          poll_id: string;
          option_text: string;
          display_order: number;
          vote_count: number;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_text: string;
          display_order?: number;
        };
        Update: {
          option_text?: string;
          display_order?: number;
          vote_count?: number;
        };
        Relationships: [];
      };

      poll_votes: {
        Row: {
          id: string;
          poll_id: string;
          option_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_id: string;
          user_id: string;
        };
        Update: never;
        Relationships: [];
      };

      desks: {
        Row: {
          id: string;
          story_id: string;
          owner_id: string;
          title: string;
          brief: string | null;
          status: DeskStatus;
          max_cowriters: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          owner_id: string;
          title: string;
          brief?: string | null;
          status?: DeskStatus;
          max_cowriters?: number;
        };
        Update: {
          title?: string;
          brief?: string | null;
          status?: DeskStatus;
          max_cowriters?: number;
          updated_at?: string;
        };
        Relationships: [];
      };

      desk_members: {
        Row: {
          id: string;
          desk_id: string;
          user_id: string;
          role: DeskRole;
          joined_at: string;
        };
        Insert: {
          id?: string;
          desk_id: string;
          user_id: string;
          role?: DeskRole;
        };
        Update: {
          role?: DeskRole;
        };
        Relationships: [];
      };

      desk_invites: {
        Row: {
          id: string;
          desk_id: string;
          invited_user_id: string;
          invited_by: string;
          status: InviteStatus;
          message: string | null;
          created_at: string;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          desk_id: string;
          invited_user_id: string;
          invited_by: string;
          message?: string | null;
          status?: InviteStatus;
        };
        Update: {
          status?: InviteStatus;
          responded_at?: string | null;
        };
        Relationships: [];
      };

      desk_submissions: {
        Row: {
          id: string;
          desk_id: string;
          chapter_number: number;
          submitted_by: string;
          title: string | null;
          content: string;
          word_count: number;
          is_approved: boolean;
          approved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          desk_id: string;
          chapter_number: number;
          submitted_by: string;
          title?: string | null;
          content: string;
          word_count?: number;
          is_approved?: boolean;
          approved_at?: string | null;
        };
        Update: {
          is_approved?: boolean;
          approved_at?: string | null;
        };
        Relationships: [];
      };

      memberships: {
        Row: {
          user_id: string;
          tier: MembershipTier;
          status: MembershipStatus;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          sparks_allowance: number;
          last_grant_at: string | null;
          next_grant_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          tier?: MembershipTier;
          status?: MembershipStatus;
          sparks_allowance?: number;
        };
        Update: {
          tier?: MembershipTier;
          status?: MembershipStatus;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          sparks_allowance?: number;
          last_grant_at?: string | null;
          next_grant_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      audio_assets: {
        Row: {
          id: string;
          chapter_id: string;
          storage_path: string | null;
          voice_id: string;
          duration_seconds: number | null;
          size_bytes: number | null;
          status: AudioStatus;
          error_message: string | null;
          generated_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          storage_path?: string | null;
          voice_id: string;
          duration_seconds?: number | null;
          size_bytes?: number | null;
          status?: AudioStatus;
          error_message?: string | null;
          generated_at?: string | null;
        };
        Update: {
          storage_path?: string | null;
          duration_seconds?: number | null;
          size_bytes?: number | null;
          status?: AudioStatus;
          error_message?: string | null;
          generated_at?: string | null;
        };
        Relationships: [];
      };

      reading_progress: {
        Row: {
          id: string;
          user_id: string;
          story_id: string;
          chapter_id: string;
          scroll_percent: number;
          last_read_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          chapter_id: string;
          scroll_percent?: number;
          last_read_at?: string;
        };
        Update: {
          chapter_id?: string;
          scroll_percent?: number;
          last_read_at?: string;
        };
        Relationships: [];
      };

      library_entries: {
        Row: {
          id: string;
          user_id: string;
          story_id: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          added_at?: string;
        };
        Update: never;
        Relationships: [];
      };

      donation_links: {
        Row: {
          id: string;
          author_id: string;
          platform: DonationPlatform;
          label: string | null;
          url: string;
          is_primary: boolean;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          platform: DonationPlatform;
          label?: string | null;
          url: string;
          is_primary?: boolean;
          is_active?: boolean;
          display_order?: number;
        };
        Update: {
          platform?: DonationPlatform;
          label?: string | null;
          url?: string;
          is_primary?: boolean;
          is_active?: boolean;
          display_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };

      donation_clicks: {
        Row: {
          id: string;
          author_id: string;
          platform: DonationPlatform;
          clicked_by: string | null;
          clicked_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          platform: DonationPlatform;
          clicked_by?: string | null;
          clicked_at?: string;
        };
        Update: never; // append-only analytics
        Relationships: [];
      };

      genres: {
        Row: {
          id: number;
          slug: string;
          name: string;
          description: string | null;
        };
        Insert: {
          id?: number;
          slug: string;
          name: string;
          description?: string | null;
        };
        Update: {
          slug?: string;
          name?: string;
          description?: string | null;
        };
        Relationships: [];
      };
    };

    Views: {
      spark_balances: {
        Row: {
          user_id: string;
          balance: number;
        };
        Relationships: [];
      };
      chapter_spark_totals: {
        Row: {
          chapter_id: string;
          sparks_received: number;
        };
        Relationships: [];
      };
      author_spark_totals: {
        Row: {
          author_id: string;
          sparks_received: number;
        };
        Relationships: [];
      };
    };

    Functions: {
      spend_sparks: {
        Args: {
          p_user_id: string;
          p_chapter_id: string;
          p_amount: number;
          p_note?: string | null;
        };
        Returns: Database['public']['Tables']['spark_ledger']['Row'];
      };
      grant_monthly_sparks: {
        Args: Record<string, never>;
        Returns: number;
      };
      tally_poll_votes: {
        Args: { p_poll_id: string };
        Returns: string;
      };
      publish_scheduled_chapters: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      close_expired_polls: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };

    Enums: {
      story_status: StoryStatus;
      publish_mode: PublishMode;
      content_rating: ContentRating;
      spark_reason: SparkReason;
      poll_status: PollStatus;
      desk_role: DeskRole;
      desk_status: DeskStatus;
      invite_status: InviteStatus;
      membership_tier: MembershipTier;
      membership_status: MembershipStatus;
      donation_platform: DonationPlatform;
      audio_status: AudioStatus;
    };
  };
}

// ---------------------------------------------------------------------------
// Convenience aliases — so you can write `Tables<'stories'>` instead of
// `Database['public']['Tables']['stories']['Row']`
// ---------------------------------------------------------------------------
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row'];