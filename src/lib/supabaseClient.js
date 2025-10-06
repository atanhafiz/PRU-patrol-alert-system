import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Gunakan unique storage key supaya tak clash dengan
 * Supabase instance lain (contohnya AdminApp, MainApp, dsb)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: "pru_guard_light_auth", // 👈 ini kunci magic elak duplicate client
  },
});
