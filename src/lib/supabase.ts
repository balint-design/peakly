import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  toast.error('Missing Supabase configuration');
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: { 'x-application-name': 'peakly' },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    db: {
      schema: 'public',
    },
  }
);

// Add error handling wrapper
export async function handleSupabaseError<T>(
  promise: Promise<{ data: T | null; error: any }>,
  errorMessage: string
): Promise<T | null> {
  try {
    const { data, error } = await promise;
    if (error) {
      console.error(`${errorMessage}:`, error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    toast.error(errorMessage);
    return null;
  }
}