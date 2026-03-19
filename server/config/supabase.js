const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isMissingOrPlaceholder = (value) => {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return (
    normalized === '' ||
    normalized.includes('your_supabase_') ||
    normalized.includes('your_') ||
    normalized.includes('placeholder')
  );
};

const hasValidSupabaseConfig = () => {
  return (
    !isMissingOrPlaceholder(supabaseUrl) &&
    !isMissingOrPlaceholder(supabaseAnonKey) &&
    !isMissingOrPlaceholder(supabaseServiceRoleKey)
  );
};

const getSupabaseConfigError = () => {
  if (hasValidSupabaseConfig()) {
    return null;
  }

  return 'Supabase is not configured. Set real SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in server/.env and restart server.';
};

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  console.warn('Supabase environment variables are missing. Set SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.');
}

const fallbackUrl = 'http://localhost:54321';
const fallbackAnonKey = 'missing-anon-key';
const fallbackServiceRoleKey = 'missing-service-role-key';

const supabaseAuthClient = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackAnonKey
);

const supabaseAdminClient = createClient(
  supabaseUrl || fallbackUrl,
  supabaseServiceRoleKey || fallbackServiceRoleKey
);

module.exports = {
  supabaseAuthClient,
  supabaseAdminClient,
  hasValidSupabaseConfig,
  getSupabaseConfigError
};
