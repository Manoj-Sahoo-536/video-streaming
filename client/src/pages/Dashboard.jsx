import { useEffect, useState } from 'react';
import api from '../api/axios';

function Dashboard() {
  const [analytics, setAnalytics] = useState({ totalUsers: 0, totalVideos: 0, totalViews: 0 });
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      const [analyticsResult, videosResult] = await Promise.allSettled([
        api.get('/users/analytics'),
        api.get('/videos')
      ]);

      if (analyticsResult.status === 'fulfilled') {
        setAnalytics(analyticsResult.value.data || { totalUsers: 0, totalVideos: 0, totalViews: 0 });
      } else {
        setAnalytics({ totalUsers: 0, totalVideos: 0, totalViews: 0 });
        setError(analyticsResult.reason?.response?.data?.message || 'Failed to load analytics.');
      }

      if (videosResult.status === 'fulfilled') {
        setVideos(videosResult.value.data || []);
      } else {
        setVideos([]);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const fallbackTotalVideos = videos.length;
  const fallbackTotalViews = videos.reduce((sum, video) => sum + Number(video.views || 0), 0);
  const totalVideos = Number.isFinite(Number(analytics.totalVideos)) ? Number(analytics.totalVideos) : fallbackTotalVideos;
  const totalViews = Number.isFinite(Number(analytics.totalViews)) ? Number(analytics.totalViews) : fallbackTotalViews;

  if (loading) {
    return <div className="alert alert-info">Loading dashboard...</div>;
  }

  return (
    <div>
      <h4 className="mb-3">Admin Dashboard</h4>
      {error && <div className="alert alert-warning">{error}</div>}
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Total Users</h6>
              <h3>{analytics.totalUsers}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Total Videos</h6>
              <h3>{totalVideos}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Total Views</h6>
              <h3>{totalViews}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h6 className="mb-3">Recent Videos</h6>
          {videos.length === 0 ? (
            <div className="text-muted">No videos available.</div>
          ) : (
            videos.slice(0, 10).map((video) => (
              <div className="d-flex justify-content-between border-bottom py-2" key={video._id}>
                <span>{video.title}</span>
                <small className="text-muted">{video.views || 0} views</small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
