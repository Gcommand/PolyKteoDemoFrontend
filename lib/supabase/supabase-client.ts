import { createClient, SupabaseClient } from "@supabase/supabase-js";

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!clientInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables not found. Supabase functionality will be disabled.');
      return null;
    }
    
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return clientInstance;
};

// For backward compatibility, export a function that returns the client
export const supabaseClient = getSupabaseClient;
