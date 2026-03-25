import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import api from './api/axios';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Watch from './pages/Watch';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Playlists from './pages/Playlists';
import LikedVideos from './pages/LikedVideos';
import YourVideos from './pages/YourVideos';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (_error) {
    return {};
  }
};

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const hasValidToken = token && token !== 'null' && token !== 'undefined';
  if (!hasValidToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children, user }) {
  const token = localStorage.getItem('token');
  const hasValidToken = token && token !== 'null' && token !== 'undefined';
  const normalizedRole = String(user?.role || '').toLowerCase();

  if (!hasValidToken) {
    return <Navigate to="/login" replace />;
  }

  if (normalizedRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const location = useLocation();
  const watermarkText = '© 2026 StreamVault';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const hasValidToken = token && token !== 'null' && token !== 'undefined';

    if (!hasValidToken) {
      setCurrentUser({});
      return;
    }

    const hydrateProfile = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        if (data?.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setCurrentUser(data.user);
        }
      } catch (_error) {
        setCurrentUser(getStoredUser());
      }
    };

    hydrateProfile();
  }, [location.pathname]);

  // Auth pages should not show the sidebar
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className={`app-shell ${sidebarMinimized ? 'sidebar-minimized' : ''}`}>
      <Navbar onToggleSidebar={() => setSidebarMinimized((p) => !p)} />

      <div className="main-layout">
        {!isAuthPage && <Sidebar user={currentUser} />}

        <main
          className="content-area"
          style={isAuthPage ? { marginLeft: 0, padding: 0 } : {}}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playlists"
              element={
                <ProtectedRoute>
                  <Playlists />
                </ProtectedRoute>
              }
            />
            <Route
              path="/liked-videos"
              element={
                <ProtectedRoute>
                  <LikedVideos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/your-videos"
              element={
                <ProtectedRoute>
                  <YourVideos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <AdminRoute user={currentUser}>
                  <Dashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </main>
      </div>

      <div className="sv-watermark" aria-hidden="true">
        {watermarkText}
      </div>
    </div>
  );
}

export default App;
