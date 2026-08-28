import { supabase, apiResponse } from './client';
import { User } from '../types/user';

export const authApi = {
  // Sign up new user
  signUp: async (email: string, password: string, userData: Partial<User>) => {
    return apiResponse(
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: userData.display_name,
            user_type: userData.user_type || 'reader',
          },
        },
      })
    );
  },

  // Sign in user
  signIn: async (email: string, password: string) => {
    return apiResponse(
      supabase.auth.signInWithPassword({
        email,
        password,
      })
    );
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    return apiResponse(
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
    );
  },

  // Sign out
  signOut: async () => {
    return apiResponse(
      supabase.auth.signOut()
    );
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Get current session
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Reset password
  resetPassword: async (email: string) => {
    return apiResponse(
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
    );
  },

  // Update user
  updateUser: async (updates: Partial<User>) => {
    return apiResponse(
      supabase.auth.updateUser({
        data: updates,
      })
    );
  },
};