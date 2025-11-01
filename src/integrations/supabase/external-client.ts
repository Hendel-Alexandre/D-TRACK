// External Supabase client - Main database connection
// IMPORTANT: Replace these values with your actual Supabase project credentials
// Your Supabase URL and anon key are safe to expose in frontend code
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// TODO: Replace with your actual Supabase project URL
const EXTERNAL_SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';

// TODO: Replace with your actual Supabase anon/publishable key
const EXTERNAL_SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

if (!EXTERNAL_SUPABASE_URL || !EXTERNAL_SUPABASE_ANON_KEY || 
    EXTERNAL_SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL') {
  throw new Error('Please configure your external Supabase credentials in src/integrations/supabase/external-client.ts');
}

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
