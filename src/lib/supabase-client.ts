
import { createClient } from '@supabase/supabase-js'

// IMPORTANT: These environment variables must be set in your hosting environment (e.g., Vercel).
// They are not hardcoded in the repository for security reasons.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be defined in your environment variables.');
}

// Create a single, shared Supabase client for the application
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
