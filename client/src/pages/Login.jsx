import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', form);

      if (!data?.token) {
        setError('Login did not return a valid token. Please verify your account and try again.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" role="main">
      <div className="auth-bg-glow" aria-hidden="true" />

      <div className="auth-card animate-scale-in" role="region" aria-label="Login form">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon" aria-hidden="true">▶</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your StreamVault account</p>
        </div>

        {/* Form */}
        <form id="login-form" onSubmit={submitHandler} aria-label="Login">
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              required
              autoFocus
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              aria-required="true"
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                aria-required="true"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                id="toggle-password-btn"
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
          </div>

          {error && (
            <div className="auth-error" role="alert" aria-live="assertive">
              <span aria-hidden="true">❌</span> {error}
            </div>
          )}

          <button
            id="login-submit-btn"
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            aria-label={loading ? 'Logging in...' : 'Login'}
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
                Signing in...
              </span>
            ) : (
              '🔐 Sign In'
            )}
          </button>
        </form>

        <div className="auth-divider" aria-hidden="true">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">OR</span>
          <div className="auth-divider-line" />
        </div>

        <p className="auth-link-text">
          Don't have an account?{' '}
          <Link to="/register" id="go-to-register-link" className="auth-link">
            Create one free →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
