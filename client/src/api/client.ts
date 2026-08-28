import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Error handling helper
export const handleApiError = (error: any): string => {
  console.error('API Error:', error);
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

// Response type
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Helper to wrap Supabase responses
export const apiResponse = async <T>(
  promise: Promise<{ data: T | null; error: any }>
): Promise<ApiResponse<T>> => {
  try {
    const { data, error } = await promise;
    if (error) {
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleApiError(error) };
  }
};