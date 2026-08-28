import { User } from './user';
import { Book } from './book';
import { IconProps } from './icons';

export interface CoWritingInvite {
  id: string;
  book_id: string;
  inviter_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  message?: string;
  created_at: string;
  responded_at?: string;
  expires_at?: string;
  inviter?: User;
  invitee?: User;
  book?: Book;
}

export interface CoWritingContribution {
  id: string;
  book_id: string;
  author_id: string;
  chapter_title: string;
  content: string;
  status: 'submitted' | 'accepted' | 'rejected' | 'draft';
  submitted_at: string;
  accepted_at?: string;
  rejected_at?: string;
  feedback?: string;
  word_count: number;
  author?: User;
}

export interface CoWritingCollaboration {
  book_id: string;
  collaborators: User[];
  roles: Record<string, 'primary' | 'co-writer' | 'editor'>;
  permissions: Record<string, string[]>;
  currentDrafts: CoWritingContribution[];
}

export interface CoWritingPermission {
  canEdit: boolean;
  canPublish: boolean;
  canInvite: boolean;
  canDelete: boolean;
}