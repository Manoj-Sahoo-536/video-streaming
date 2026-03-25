import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import VideoCard from '../components/VideoCard';

function YourVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadYourVideos = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/videos/my-videos');
        setVideos(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your videos.');
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    loadYourVideos();
  }, []);

  return (
    <main className="page-content" role="main" style={{ padding: '24px 32px' }}>
      <h1 style={{ fontSize: 26, marginBottom: 10 }}>Your Videos</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 22 }}>
        All videos uploaded by your account.
      </p>

      {error && (
        <div className="sv-alert sv-alert-danger" role="alert" style={{ marginBottom: 18 }}>
          <span aria-hidden="true">❗</span> {error}
        </div>
      )}

      {loading ? (
        <div className="loading-center" role="status" aria-live="polite">
          <div className="sv-spinner" aria-hidden="true" />
          <p className="loading-text">Loading your videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-state" role="status" aria-live="polite" style={{ marginTop: 40 }}>
          <div className="empty-state-icon" aria-hidden="true">🎥</div>
          <p className="empty-state-title">You haven’t uploaded any video yet</p>
          <p className="empty-state-sub">Upload your first video to start your channel.</p>
          <Link to="/upload" className="sv-btn sv-btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
            Upload Video
          </Link>
        </div>
      ) : (
        <section aria-label={`${videos.length} uploaded videos`}>
          <div className="videos-grid animate-fade-up">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default YourVideos;
