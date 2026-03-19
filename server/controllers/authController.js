const {
  supabaseAuthClient,
  supabaseAdminClient,
  hasValidSupabaseConfig,
  getSupabaseConfigError
} = require('../config/supabase');

const tryAutoConfirmUserEmail = async (email) => {
  const { data: profileData, error: profileError } = await supabaseAdminClient
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (profileError || !profileData?.id) {
    return false;
  }

  const { error: confirmError } = await supabaseAdminClient.auth.admin.updateUserById(profileData.id, {
    email_confirm: true
  });

  return !confirmError;
};

const register = async (req, res) => {
  try {
    if (!hasValidSupabaseConfig()) {
      return res.status(500).json({ message: getSupabaseConfigError() });
    }

    const { name, password } = req.body;
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!String(name || '').trim() || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const { data: existingProfile, error: existingProfileError } = await supabaseAdminClient
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingProfileError) {
      return res.status(500).json({ message: existingProfileError.message });
    }

    if (existingProfile?.id) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const { data: signUpData, error: signUpError } = await supabaseAuthClient.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (signUpError || !signUpData?.user) {
      const signUpMessage = signUpError?.message || 'Registration failed';
      const isAlreadyRegistered = signUpMessage.toLowerCase().includes('already registered');
      return res.status(isAlreadyRegistered ? 409 : 400).json({ message: signUpMessage });
    }

    const { error: profileUpsertError } = await supabaseAdminClient.from('users').upsert(
      {
        id: signUpData.user.id,
        name: String(name).trim(),
        email,
        role: 'user'
      },
      { onConflict: 'id' }
    );

    if (profileUpsertError) {
      await supabaseAdminClient.auth.admin.deleteUser(signUpData.user.id);
      return res.status(500).json({ message: profileUpsertError.message });
    }

    const { data: signInData, error: signInError } = await supabaseAuthClient.auth.signInWithPassword({
      email,
      password
    });

    if (signInError || !signInData?.session) {
      return res.status(201).json({
        token: null,
        user: {
          id: signUpData.user.id,
          name,
          email,
          profilePic: '',
          role: 'user'
        },
        message: 'Registered successfully. Please verify email if required and login.'
      });
    }

    return res.status(201).json({
      token: signInData.session.access_token,
      user: {
        id: signInData.user.id,
        name,
        email,
        profilePic: '',
        role: 'user'
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    if (!hasValidSupabaseConfig()) {
      return res.status(500).json({ message: getSupabaseConfigError() });
    }

    const email = String(req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let { data: authData, error: authError } = await supabaseAuthClient.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData?.session) {
      const authMessage = authError?.message || 'Invalid credentials';
      const lowerMessage = authMessage.toLowerCase();

      if (lowerMessage.includes('email not confirmed')) {
        const confirmed = await tryAutoConfirmUserEmail(email);

        if (confirmed) {
          const retry = await supabaseAuthClient.auth.signInWithPassword({
            email,
            password
          });

          authData = retry.data;
          authError = retry.error;
        }

        if (!authData?.session || authError) {
          return res.status(403).json({
            message: 'Email not confirmed. Please verify your email or register again after disabling confirmation.'
          });
        }
      }

      if (!authData?.session || authError) {
        return res.status(401).json({ message: authMessage });
      }
    }

    const { data: profileData, error: profileError } = await supabaseAdminClient
      .from('users')
      .select('id, name, email, profile_pic_url, role')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError) {
      return res.status(500).json({ message: profileError.message });
    }

    const fallbackUser = {
      id: authData.user.id,
      name: authData.user.user_metadata?.name || '',
      email: authData.user.email,
      profilePic: '',
      role: 'user'
    };

    const user = profileData
      ? {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          profilePic: profileData.profile_pic_url || '',
          role: profileData.role || 'user'
        }
      : fallbackUser;

    return res.status(200).json({
      token: authData.session.access_token,
      user
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const profile = async (req, res) => {
  try {
    if (!hasValidSupabaseConfig()) {
      return res.status(500).json({ message: getSupabaseConfigError() });
    }

    const { data: user, error } = await supabaseAdminClient
      .from('users')
      .select('id, name, email, profile_pic_url, role, created_at')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePic: user.profile_pic_url || '',
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  profile
};
