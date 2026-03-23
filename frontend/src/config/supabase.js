import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Provide a safe way to initialize without crashing the whole app
let supabaseClient = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error('[SUPABASE] Initialization failed:', err);
  }
} else {
  console.warn('[SUPABASE] Missing frontend environment variables. SSO will be disabled.');
}

export const supabase = supabaseClient;
