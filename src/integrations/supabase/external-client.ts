// External Supabase client - Main database connection
// IMPORTANT: Replace these values with your actual Supabase project credentials
// Your Supabase URL and anon key are safe to expose in frontend code
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const EXTERNAL_SUPABASE_URL = 'https://aoijgywewdgubcbvfnor.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvaWpneXdld2RndWJjYnZmbm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTMwNTIsImV4cCI6MjA3Njk4OTA1Mn0.1vFrtdby9WT_Fyo4jRZfJ1abWTiFR0ermdwlMUBDHvQ';

export const supabase = createClient<Database>(
  EXTERNAL_SUPABASE_URL,
  EXTERNAL_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
