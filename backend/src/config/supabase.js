const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[SUPABASE] Missing environment variables. Auth will fail.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
