import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let keyPrefix = "pru_default_auth";
if (typeof window !== "undefined") {
  const path = window.location.pathname.toLowerCase();
  if (path.includes("/admin")) keyPrefix = "pru_admin_app_auth";
  else if (path.includes("/light")) keyPrefix = "pru_guard_light_auth";
  else if (path.includes("/guard")) keyPrefix = "pru_guard_app_auth";
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: keyPrefix,
  },
});

console.log(`🔑 Supabase active → ${keyPrefix}`);

// Dual export (default + named)
export { supabase };
export default supabase;