// LetOption — Supabase client (shared across all pages)
// Loaded via CDN script tag before this file in each HTML page.
// The anon key below is the PUBLIC key — safe to expose in frontend code.
// Never put the service_role key here.

const SUPABASE_URL = 'https://jjeepjkyfybcmlawmbyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZWVwamt5ZnliY21sYXdtYnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODg4NDcsImV4cCI6MjA5ODA2NDg0N30.7aq5526wGpYWjSW_32mOr72NGIuxr7YwsqxI_RnHF8A';

// If the Supabase CDN script (https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2)
// failed to load — slow connection, ad blocker, CDN outage — window.supabase
// won't exist yet. Without this guard, the line below throws and silently
// kills every script that runs after it on the page (forms, nav, booking).
let supabase;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.error('LetOption: Supabase library failed to load from CDN. Login, signup, and booking forms will not work until the page is reloaded with a working connection.');
  // A minimal stand-in so calls like supabase.auth.getSession() fail with a
  // clear, catchable error instead of "supabase is not defined" crashing
  // the whole script.
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: { message: 'Connection to login service failed. Please refresh the page and try again.' } }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Connection to login service failed. Please refresh the page and try again.' } }),
      signUp: async () => ({ data: null, error: { message: 'Connection to login service failed. Please refresh the page and try again.' } }),
      signOut: async () => {},
    },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: { message: 'Connection failed.' } }) }), order: async () => ({ data: null, error: { message: 'Connection failed.' } }) }) }),
    rpc: async () => ({ data: null, error: { message: 'Connection to booking service failed. Please refresh the page and try again.' } }),
  };
}
