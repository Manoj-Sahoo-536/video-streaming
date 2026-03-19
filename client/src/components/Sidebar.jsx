import { Link } from 'react-router-dom';

function Sidebar({ user }) {
  let fallbackUser = {};

  try {
    fallbackUser = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (_error) {
    fallbackUser = {};
  }

  const activeUser = user && Object.keys(user).length ? user : fallbackUser;
  const normalizedRole = String(activeUser?.role || '').toLowerCase();

  return (
    <aside className="sidebar">
      <h6 className="text-uppercase text-muted">Menu</h6>
      <div className="list-group list-group-flush mt-3">
        <Link className="list-group-item list-group-item-action" to="/">
          Home
        </Link>
        <Link className="list-group-item list-group-item-action" to="/upload">
          Upload
        </Link>
        {normalizedRole === 'admin' && (
          <Link className="list-group-item list-group-item-action" to="/dashboard">
            Dashboard
          </Link>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
