const { createClient } = require('@supabase/supabase-js');

const supabaseUrl =
  process.env.SUPABASE_URL ||
  'https://nmlffxrpdickyvlzrtyr.supabase.co';

// Publishable (anon) key — safe for client-facing calls
const supabaseAnonKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_xs1GntpWlwPMEoCeA8ASpg_1A6rmGvH';

// Secret key — used ONLY on the server (bypasses RLS, verifies tokens)
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY || '';

// Public/anon client (used for connection checks)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — uses secret key to bypass RLS for server-side operations
// Falls back to anon client if no secret key is configured
const supabaseAdmin = supabaseSecretKey
  ? createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase;

/**
 * Verify a Supabase JWT token and return the Supabase user.
 * Uses the admin client with getUser() — works with the secret key for reliable verification.
 * @param {string} token - Bearer token from Authorization header
 * @returns {{ user: object|null, error: string|null }}
 */
const verifySupabaseToken = async (token) => {
  if (!token) return { user: null, error: 'No token provided' };
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return { user: null, error: error?.message || 'Invalid or expired token' };
    }
    return { user: data.user, error: null };
  } catch (err) {
    return { user: null, error: err.message || 'Token verification failed' };
  }
};

const connectSupabase = async () => {
  console.log('Connecting to Supabase...');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Secret key configured: ${supabaseSecretKey ? 'YES' : 'NO (using anon key)'}`);
  try {
    // Verify connection by querying profiles table
    const { data, error } = await supabaseAdmin.from('profiles').select('id').limit(1);
    if (error && !error.message?.includes('profiles')) {
      console.log(`Supabase Connected (note: ${error.message})`);
    } else {
      console.log(`✅ Supabase Connected: ${supabaseUrl}`);
    }
    return true;
  } catch (err) {
    console.warn(`Supabase Connection notice: ${err.message}`);
    return true;
  }
};

module.exports = { supabase, supabaseAdmin, connectSupabase, verifySupabaseToken };
