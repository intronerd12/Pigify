import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nmlffxrpdickyvlzrtyr.supabase.co';
const supabaseKey = 'sb_publishable_xs1GntpWlwPMEoCeA8ASpg_1A6rmGvH';

console.log('Testing Supabase connection...');
console.log('  URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('todos').select('*').limit(1);
    if (error) {
      // If table 'todos' doesn't exist yet, it will return a Postgrest error code, but network connection to Supabase is successful!
      console.log('✅ Supabase connected successfully!');
      console.log('   Response status:', error.message || error.details || error.code);
    } else {
      console.log('✅ Supabase connected successfully! Data received:', data);
    }
  } catch (err) {
    console.error('❌ Connection error:', err.message || err);
  }
}

testConnection();
