export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  user_type: 'reader' | 'author';
  created_at: string;
  updated_at: string;
  last_active?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  font_size: 'small' | 'medium' | 'large';
  reading_mode: 'day' | 'night';
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  mentions: boolean;
  new_chapters: boolean;
  poll_updates: boolean;
  co_writing_invites: boolean;
}

export interface UserSession {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}