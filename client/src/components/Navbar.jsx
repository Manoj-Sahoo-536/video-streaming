import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [navSearch, setNavSearch] = useState('');

  let user = {};
  try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch (_) {}

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNavSearch = (e) => {
    e.preventDefault();
    const query = navSearch.trim();
    const params = new URLSearchParams(location.search);
    if (query) params.set('q', query);
    else params.delete('q');

    const search = params.toString();
    navigate({ pathname: '/', search: search ? `?${search}` : '' });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    setNavSearch(q);
  }, [location.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const query = navSearch.trim();
      const params = new URLSearchParams(location.search);
      const currentQ = params.get('q') || '';

      if (query === currentQ) {
        return;
      }

      if (query) params.set('q', query);
      else params.delete('q');

      const search = params.toString();
      navigate({ pathname: '/', search: search ? `?${search}` : '' }, { replace: true });
    }, 180);

    return () => clearTimeout(timer);
  }, [navSearch, location.search, navigate]);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav className="sv-navbar" role="navigation" aria-label="Main navigation">
      {/* Brand */}
      <div className="sv-brand-wrapper">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', padding: '4px 8px', borderRadius: 4 }}
            aria-label="Toggle Sidebar"
          >
            ☰
          </button>
        )}
        <Link className="sv-navbar-brand" to="/" aria-label="StreamVault Home">
          <div className="sv-brand-icon" aria-hidden="true">▶</div>
          <span className="sv-brand-text">StreamVault</span>
        </Link>
      </div>

      {/* Search */}
      <form className="sv-search-wrapper" onSubmit={handleNavSearch} role="search">
        <span className="sv-search-icon" aria-hidden="true">🔍</span>
        <input
          id="navbar-search"
          className="sv-search-input"
          type="search"
          placeholder="Search videos, creators..."
          value={navSearch}
          onChange={(e) => setNavSearch(e.target.value)}
          aria-label="Search videos"
        />
      </form>

      {/* Actions */}
      <div className="sv-navbar-actions">
        {token && (
          <Link
            id="nav-upload-btn"
            className="sv-btn sv-btn-primary"
            to="/upload"
            aria-label="Upload video"
          >
            <span aria-hidden="true">⬆</span> Upload
          </Link>
        )}

        {token ? (
          <>
            <Link
              to="/profile"
              className="sv-avatar"
              title={user?.name || 'Profile'}
              aria-label={`User avatar for ${user?.name || 'Profile'}`}
              role="link"
              style={{ textDecoration: 'none' }}
            >
              {initials}
            </Link>
            <button
              id="nav-logout-btn"
              className="sv-btn sv-btn-danger"
              onClick={logout}
              aria-label="Logout"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              id="nav-login-btn"
              className="sv-btn sv-btn-ghost"
              to="/login"
              aria-label="Login"
            >
              Login
            </Link>
            <Link
              id="nav-register-btn"
              className="sv-btn sv-btn-primary"
              to="/register"
              aria-label="Register"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
