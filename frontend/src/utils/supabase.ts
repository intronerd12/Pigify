import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://nmlffxrpdickyvlzrtyr.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_xs1GntpWlwPMEoCeA8ASpg_1A6rmGvH";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
