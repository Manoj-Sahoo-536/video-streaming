const {
  supabaseAdminClient,
  hasValidSupabaseConfig,
  getSupabaseConfigError
} = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  if (!hasValidSupabaseConfig()) {
    return res.status(500).json({ message: getSupabaseConfigError() });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: authData, error: authError } = await supabaseAdminClient.auth.getUser(token);

    if (authError || !authData?.user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const { data: profile, error: profileError } = await supabaseAdminClient
      .from('users')
      .select('id, email, role, name, profile_pic_url')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError) {
      return res.status(500).json({ message: profileError.message });
    }

    req.user = {
      id: authData.user.id,
      email: profile?.email || authData.user.email,
      role: profile?.role || 'user',
      name: profile?.name || authData.user.user_metadata?.name || '',
      profilePic: profile?.profile_pic_url || ''
    };

    return next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const adminOnly = (_req, res, next) => {
  if (_req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
};

module.exports = { authMiddleware, adminOnly };
