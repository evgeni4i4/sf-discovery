import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser/client-side Supabase client.
 * Uses the anon key and respects RLS policies.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Create a server-side Supabase client with the service role key.
 * Only use this in API routes / server actions -- never expose to the browser.
 */
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient<Database>(supabaseUrl, serviceKey);
}
