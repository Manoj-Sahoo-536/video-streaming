import { useEffect, useState } from 'react';
import api from '../api/axios';

function formatViews(v) {
  const n = Number(v || 0);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function Dashboard() {
  const [analytics, setAnalytics] = useState({ totalUsers: 0, totalVideos: 0, totalViews: 0 });
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');

    const [analyticsResult, videosResult] = await Promise.allSettled([
      api.get('/users/analytics'),
      api.get('/videos'),
    ]);

    if (analyticsResult.status === 'fulfilled') {
      setAnalytics(analyticsResult.value.data || { totalUsers: 0, totalVideos: 0, totalViews: 0 });
    } else {
      setAnalytics({ totalUsers: 0, totalVideos: 0, totalViews: 0 });
      setError(analyticsResult.reason?.response?.data?.message || 'Could not load analytics.');
    }

    if (videosResult.status === 'fulfilled') {
      setVideos(videosResult.value.data || []);
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (videoId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(videoId);
    try {
      await api.delete(`/videos/${videoId}`);
      setDeleteSuccess(`"${title}" was deleted.`);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      setTimeout(() => setDeleteSuccess(''), 4000);
    } catch (_err) {
      setError('Failed to delete video. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const fallbackTotalVideos = videos.length;
  const fallbackTotalViews = videos.reduce((sum, v) => sum + Number(v.views || 0), 0);
  const totalVideos = Number.isFinite(Number(analytics.totalVideos)) ? Number(analytics.totalVideos) : fallbackTotalVideos;
  const totalViews = Number.isFinite(Number(analytics.totalViews)) ? Number(analytics.totalViews) : fallbackTotalViews;

  const statCards = [
    { label: 'Total Users', value: analytics.totalUsers, icon: '👥', colorClass: 'purple' },
    { label: 'Total Videos', value: totalVideos, icon: '🎬', colorClass: 'cyan' },
    { label: 'Total Views', value: formatViews(totalViews), icon: '👁', colorClass: 'pink' },
    { label: 'Avg. Views/Video', value: totalVideos > 0 ? formatViews(Math.round(Number(totalViews) / totalVideos)) : 0, icon: '📈', colorClass: 'green' },
  ];

  if (loading) {
    return (
      <div className="loading-center page-content" role="status" aria-live="polite">
        <div className="sv-spinner" aria-hidden="true" />
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <main className="page-content" role="main">
      {/* Header */}
      <div className="dashboard-header animate-fade-up">
        <div>
          <h1 className="dashboard-title">📊 Admin Dashboard</h1>
          <p className="dashboard-sub">Platform analytics and video management</p>
        </div>
        <button
          id="refresh-dashboard-btn"
          className="sv-btn sv-btn-ghost"
          onClick={fetchData}
          aria-label="Refresh dashboard data"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="sv-alert sv-alert-warning animate-fade-up" role="alert" aria-live="polite">
          <span aria-hidden="true">⚠️</span> {error}
        </div>
      )}
      {deleteSuccess && (
        <div className="sv-alert sv-alert-success animate-fade-up" role="status" aria-live="polite">
          <span aria-hidden="true">✅</span> {deleteSuccess}
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid" role="region" aria-label="Platform statistics">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            id={`stat-card-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
            className={`stat-card animate-fade-up stagger-${i + 1}`}
          >
            <div className={`stat-card-icon ${card.colorClass}`} aria-hidden="true">
              {card.icon}
            </div>
            <div className="stat-card-label">{card.label}</div>
            <div className="stat-card-value" aria-label={`${card.label}: ${card.value}`}>
              {card.value}
            </div>
            <div className="stat-card-trend">↑ Platform total</div>
          </div>
        ))}
      </div>

      {/* Videos Table */}
      <div className="dashboard-table-card animate-fade-up" role="region" aria-label="Video management table">
        <div className="dashboard-table-header">
          <h2 className="dashboard-table-title">
            🎬 All Videos
            <span className="section-title-pill" style={{ marginLeft: 10 }}>{videos.length}</span>
          </h2>
        </div>

        {videos.length === 0 ? (
          <div className="empty-state" style={{ border: 'none', borderRadius: 0 }} role="status">
            <div className="empty-state-icon" aria-hidden="true">📭</div>
            <p className="empty-state-title">No videos yet</p>
            <p className="empty-state-sub">Videos uploaded by users will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              className="dashboard-table"
              role="table"
              aria-label="Videos table"
            >
              <thead>
                <tr>
                  <th scope="col">Thumbnail</th>
                  <th scope="col">Title</th>
                  <th scope="col">Category</th>
                  <th scope="col">Uploader</th>
                  <th scope="col">Views</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video._id}>
                    <td>
                      <img
                        className="table-video-thumb"
                        src={video.thumbnailUrl || `https://picsum.photos/seed/${video._id}/120/72`}
                        alt={video.title}
                        loading="lazy"
                        onError={(e) => { e.target.src = `https://picsum.photos/seed/${video._id}/120/72`; }}
                      />
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          maxWidth: 240,
                        }}
                        title={video.title}
                      >
                        {video.title}
                      </span>
                    </td>
                    <td>
                      <span className="table-badge" style={{
                        background: 'rgba(124, 58, 237, 0.12)',
                        border: '1px solid rgba(124, 58, 237, 0.2)',
                        color: 'var(--accent-secondary)',
                      }}>
                        {video.category || 'General'}
                      </span>
                    </td>
                    <td>{video.uploadedBy?.name || '—'}</td>
                    <td>
                      <span className="table-badge table-badge-views">
                        👁 {formatViews(video.views)}
                      </span>
                    </td>
                    <td>
                      <button
                        id={`delete-video-${video._id}`}
                        className="delete-btn"
                        onClick={() => handleDelete(video._id, video.title)}
                        disabled={deletingId === video._id}
                        aria-label={`Delete video: ${video.title}`}
                      >
                        {deletingId === video._id ? '...' : '🗑 Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default Dashboard;
