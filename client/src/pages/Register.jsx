import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', form);

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
        return;
      }

      localStorage.removeItem('token');
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/login');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const pw = form.password;
    if (!pw) return null;
    if (pw.length < 6) return { label: 'Weak', color: '#f87171', width: '30%' };
    if (pw.length < 10) return { label: 'Fair', color: '#fbbf24', width: '60%' };
    return { label: 'Strong', color: '#34d399', width: '100%' };
  };

  const strength = passwordStrength();

  return (
    <div className="auth-page" role="main">
      <div className="auth-bg-glow" aria-hidden="true" />

      <div className="auth-card animate-scale-in" role="region" aria-label="Registration form">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon" aria-hidden="true">✨</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-sub">Join StreamVault — stream and share videos</p>
        </div>

        {/* Form */}
        <form id="register-form" onSubmit={submitHandler} aria-label="Register">
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              className="auth-input"
              placeholder="Jane Doe"
              required
              autoFocus
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              aria-required="true"
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label" htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              aria-required="true"
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label" htmlFor="register-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Min. 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                aria-required="true"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                id="toggle-reg-password-btn"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: 16, padding: 4,
                }}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>

            {/* Password strength */}
            {strength && (
              <div style={{ marginTop: 8 }}>
                <div style={{
                  height: 3, background: 'var(--border-subtle)',
                  borderRadius: 50, overflow: 'hidden',
                }}>
                  <div style={{
                    width: strength.width, height: '100%',
                    background: strength.color, borderRadius: 50,
                    transition: 'width 0.3s ease, background 0.3s ease',
                  }} aria-hidden="true" />
                </div>
                <div style={{
                  fontSize: 11, color: strength.color, fontWeight: 600,
                  marginTop: 4, textAlign: 'right',
                }}>
                  {strength.label} password
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="auth-error" role="alert" aria-live="assertive">
              <span aria-hidden="true">❌</span> {error}
            </div>
          )}

          <button
            id="register-submit-btn"
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            aria-label={loading ? 'Creating account...' : 'Create account'}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 0.7s linear infinite',
                  }}
                  aria-hidden="true"
                />
                Creating account...
              </span>
            ) : (
              '✨ Create Account'
            )}
          </button>
        </form>

        <div className="auth-divider" aria-hidden="true">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">OR</span>
          <div className="auth-divider-line" />
        </div>

        <p className="auth-link-text">
          Already have an account?{' '}
          <Link to="/login" id="go-to-login-link" className="auth-link">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
