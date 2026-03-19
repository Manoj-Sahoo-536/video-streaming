import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          Video Streaming
        </Link>
        <div className="d-flex align-items-center gap-2">
          <Link className="btn btn-outline-primary btn-sm" to="/upload">
            Upload
          </Link>
          {token ? (
            <button className="btn btn-outline-danger btn-sm" onClick={logout}>
              Logout
            </button>
          ) : (
            <>
              <Link className="btn btn-outline-secondary btn-sm" to="/login">
                Login
              </Link>
              <Link className="btn btn-primary btn-sm" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
