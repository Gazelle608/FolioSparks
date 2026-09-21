// ============================================================
// Donation Links
// Mirrors: public.donation_links
// ============================================================

// Postgres enum
export type DonationPlatform =
  | 'patreon'
  | 'ko_fi'
  | 'buymeacoffee'
  | 'paypal'
  | 'stripe'
  | 'cashapp'
  | 'venmo'
  | 'custom';

// ---------------------------------------------------------------------------
// Donation link row
// ---------------------------------------------------------------------------
export interface DonationLink {
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
}

// ---------------------------------------------------------------------------
// Insert / Update
// ---------------------------------------------------------------------------
export interface DonationLinkInsert {
  author_id: string;
  platform: DonationPlatform;
  url: string;
  label?: string | null;
  is_primary?: boolean;
  is_active?: boolean;
  display_order?: number;
}

export interface DonationLinkUpdate {
  platform?: DonationPlatform;
  url?: string;
  label?: string | null;
  is_primary?: boolean;
  is_active?: boolean;
  display_order?: number;
}

// ---------------------------------------------------------------------------
// Onboarding draft — what DonationPlatformPicker collects
// ---------------------------------------------------------------------------
export interface DonationLinkDraft {
  platform: DonationPlatform;
  label?: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Click tracking (optional — for author analytics)
// ---------------------------------------------------------------------------
export interface DonationClick {
  id: string;
  author_id: string;
  platform: DonationPlatform;
  clicked_by: string | null;
  clicked_at: string;
}

export interface DonationClickInsert {
  author_id: string;
  platform: DonationPlatform;
  clicked_by: string | null;
}

// ---------------------------------------------------------------------------
// Platform metadata — used by DonationButton, DonationLinkList
// ---------------------------------------------------------------------------
export interface PlatformMeta {
  id: DonationPlatform;
  name: string;
  actionLabel: string;
  shortLabel: string;
  brandColor: string;
  urlPrefix?: string;
}