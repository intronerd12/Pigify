import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || "https://nmlffxrpdickyvlzrtyr.supabase.co";
const supabaseKey = (import.meta as any)?.env?.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_xs1GntpWlwPMEoCeA8ASpg_1A6rmGvH";

export const supabase = createClient(supabaseUrl, supabaseKey);
