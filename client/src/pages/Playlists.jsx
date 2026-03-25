import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import VideoCard from '../components/VideoCard';

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPlaylists = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/playlists');
        setPlaylists(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load playlists.');
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, []);

  return (
    <main className="page-content" role="main" style={{ padding: '24px 32px' }}>
      <h1 style={{ fontSize: 26, marginBottom: 10 }}>Playlists</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 22 }}>
        Your saved playlists and their videos.
      </p>

      {error && (
        <div className="sv-alert sv-alert-danger" role="alert" style={{ marginBottom: 18 }}>
          <span aria-hidden="true">❗</span> {error}
        </div>
      )}

      {loading ? (
        <div className="loading-center" role="status" aria-live="polite">
          <div className="sv-spinner" aria-hidden="true" />
          <p className="loading-text">Loading playlists...</p>
        </div>
      ) : playlists.length === 0 ? (
        <div className="empty-state" role="status" aria-live="polite" style={{ marginTop: 40 }}>
          <div className="empty-state-icon" aria-hidden="true">📂</div>
          <p className="empty-state-title">No playlists yet</p>
          <p className="empty-state-sub">Open a video and use Add to Playlist to create your first list.</p>
          <Link to="/" className="sv-btn sv-btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
            Explore Videos
          </Link>
        </div>
      ) : (
        <section aria-label={`${playlists.length} playlists`}>
          {playlists.map((playlist) => (
            <div key={playlist._id} style={{ marginBottom: 30 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h2 style={{ fontSize: 20 }}>{playlist.name}</h2>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  {(playlist.videos || []).length} videos
                </span>
              </div>

              {(playlist.videos || []).length === 0 ? (
                <div className="watch-description-text" style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
                  This playlist is empty.
                </div>
              ) : (
                <div className="videos-grid animate-fade-up">
                  {(playlist.videos || []).map((video) => (
                    <VideoCard key={`${playlist._id}-${video._id}`} video={video} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}

export default Playlists;
