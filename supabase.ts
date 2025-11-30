import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gjphsheavnkdtmsrxmtl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqcGhzaGVhdm5rZHRtc3J4bXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyODE1NzMsImV4cCI6MjA3OTg1NzU3M30.GH8_htMszSrylCd6rMXNXioZUKNE303T6QeTBrevAbs';

// Cliente Supabase para uso no frontend (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role key (apenas para uso em server-side, nunca exponha no frontend)
export const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqcGhzaGVhdm5rZHRtc3J4bXRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI4MTU3MywiZXhwIjoyMDc5ODU3NTczfQ.nhcQUX2WpUnz3ho_PhL3qc_flhd1BgAD01n_W0P2FTo';

// Cliente com service role (apenas para uso em Edge Functions ou backend)
// NUNCA use isso no frontend!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
