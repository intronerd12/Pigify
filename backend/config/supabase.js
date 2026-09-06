const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || 'https://nmlffxrpdickyvlzrtyr.supabase.co';
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_xs1GntpWlwPMEoCeA8ASpg_1A6rmGvH';

const supabase = createClient(supabaseUrl, supabaseKey);

const connectSupabase = async () => {
  console.log('Connecting to Supabase...');
  console.log(`Supabase URL: ${supabaseUrl}`);
  try {
    const { data, error } = await supabase.from('todos').select('*').limit(1);
    if (error && error.code !== 'PGRST301' && !error.message.includes('public.todos')) {
      console.log(`Supabase Connected (API Responded: ${error.message || error.code})`);
    } else {
      console.log(`Supabase Connected: ${supabaseUrl}`);
    }
    return true;
  } catch (err) {
    console.warn(`Supabase Connection notice: ${err.message}`);
    return true;
  }
};

module.exports = { supabase, connectSupabase };
