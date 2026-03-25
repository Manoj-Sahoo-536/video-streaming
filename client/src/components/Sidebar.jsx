import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home', icon: '🏠', exact: true },
  { to: '/upload', label: 'Upload', icon: '⬆️', protected: true },
];

const adminItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
];

function Sidebar({ user }) {
  const location = useLocation();

  let activeUser = user;
  if (!activeUser || !Object.keys(activeUser).length) {
    try { activeUser = JSON.parse(localStorage.getItem('user') || '{}'); } catch (_) { activeUser = {}; }
  }

  const normalizedRole = String(activeUser?.role || '').toLowerCase();
  const token = localStorage.getItem('token');

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sv-sidebar" role="complementary" aria-label="Sidebar navigation">
      {/* Main Nav */}
      <span className="sv-sidebar-section-title">Navigation</span>

      {navItems.map((item) => {
        if (item.protected && !token) return null;
        return (
          <Link
            key={item.to}
            to={item.to}
            id={`sidebar-${item.label.toLowerCase()}`}
            className={`sv-sidebar-item${isActive(item.to, item.exact) ? ' active' : ''}`}
            aria-label={item.label}
            aria-current={isActive(item.to, item.exact) ? 'page' : undefined}
          >
            <span className="sv-sidebar-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}

      {/* Explore */}
      <div className="sv-sidebar-divider" role="separator" />
      <span className="sv-sidebar-section-title">Explore</span>

      {['Music', 'Gaming', 'Education', 'Technology', 'Sports'].map((cat) => (
        <Link
          key={cat}
          to={`/?cat=${encodeURIComponent(cat)}`}
          id={`sidebar-cat-${cat.toLowerCase()}`}
          className="sv-sidebar-item"
          aria-label={`Browse ${cat}`}
        >
          <span className="sv-sidebar-icon" aria-hidden="true">
            {cat === 'Music' ? '🎵' : cat === 'Gaming' ? '🎮' : cat === 'Education' ? '📚' : cat === 'Technology' ? '💻' : '⚽'}
          </span>
          <span>{cat}</span>
        </Link>
      ))}

      {/* Admin */}
      {normalizedRole === 'admin' && (
        <>
          <div className="sv-sidebar-divider" role="separator" />
          <span className="sv-sidebar-section-title">Admin</span>
          {adminItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              id={`sidebar-${item.label.toLowerCase()}`}
              className={`sv-sidebar-item${isActive(item.to) ? ' active' : ''}`}
              aria-label={item.label}
              aria-current={isActive(item.to) ? 'page' : undefined}
            >
              <span className="sv-sidebar-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
              <span className="sv-sidebar-badge">Admin</span>
            </Link>
          ))}
        </>
      )}

      {/* Auth links if not logged in */}
      {!token && (
        <>
          <div className="sv-sidebar-divider" role="separator" />
          <Link
            to="/login"
            id="sidebar-login"
            className="sv-sidebar-item"
            aria-label="Login"
          >
            <span className="sv-sidebar-icon" aria-hidden="true">🔐</span>
            <span>Login</span>
          </Link>
          <Link
            to="/register"
            id="sidebar-register"
            className="sv-sidebar-item"
            aria-label="Register"
          >
            <span className="sv-sidebar-icon" aria-hidden="true">✨</span>
            <span>Register</span>
          </Link>
        </>
      )}
    </aside>
  );
}

export default Sidebar;
