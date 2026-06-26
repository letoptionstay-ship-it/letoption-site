// LetOption — Supabase client (shared across all pages)
// Loaded via CDN script tag before this file in each HTML page.
// The anon key below is the PUBLIC key — safe to expose in frontend code.
// Never put the service_role key here.

const SUPABASE_URL = 'https://jjeepjkyfybcmlawmbyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZWVwamt5ZnliY21sYXdtYnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODg4NDcsImV4cCI6MjA5ODA2NDg0N30.7aq5526wGpYWjSW_32mOr72NGIuxr7YwsqxI_RnHF8A';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
