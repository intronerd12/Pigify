import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supabase project credentials (identical 1:1 with web configuration)
export const SUPABASE_URL = 'https://nmlffxrpdickyvlzrtyr.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_xs1GntpWlwPMEoCeA8ASpg_1A6rmGvH';

/**
 * Shared Supabase Client for Pigify Mobile
 * Uses AsyncStorage for persistent cross-restart authentication identical to web localStorage.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
