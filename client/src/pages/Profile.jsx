import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = [
  'General', 'Music', 'Gaming', 'Education', 'Technology',
  'Sports', 'Comedy', 'News', 'Travel', 'Food', 'Fitness',
];

function formatViews(v) {
  const n = Number(v || 0);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ---- Edit Modal ---- */
function EditModal({ video, onClose, onSave }) {
  const [form, setForm] = useState({
    title: video.title || '',
    description: video.description || '',
    category: video.category || 'General',
    thumbnailUrl: video.thumbnailUrl || '',
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);
  const thumbInputRef = useRef(null);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setError('');
    setLoading(true);
    try {
      let payload;
      
      // If a file is selected, we MUST send FormData
      if (thumbnailFile) {
        payload = new FormData();
        payload.append('title', form.title);
        payload.append('description', form.description);
        payload.append('category', form.category);
        payload.append('thumbnail', thumbnailFile);
      } else {
        // Otherwise, send JSON
        payload = form;
      }

      const { data } = await api.patch(`/videos/${video._id}`, payload);
      onSave(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="profile-modal-backdrop"
      ref={modalRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className="profile-modal">
        {/* Header */}
        <div className="profile-modal-header">
          <h2 id="edit-modal-title" className="profile-modal-title">✏️ Edit Video</h2>
          <button
            id="close-edit-modal-btn"
            className="profile-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Thumbnail preview */}
        {(form.thumbnailUrl || video.thumbnailUrl) && (
          <div className="profile-modal-thumb-preview">
            <img
              src={form.thumbnailUrl || video.thumbnailUrl}
              alt="Thumbnail preview"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Form */}
        <form id="edit-video-form" onSubmit={handleSave}>
          <div className="profile-form-group">
            <label className="profile-form-label" htmlFor="edit-title">Title *</label>
            <input
              id="edit-title"
              className="profile-form-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Video title"
              required
              aria-required="true"
              maxLength={200}
            />
          </div>

          <div className="profile-form-group">
            <label className="profile-form-label" htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              className="profile-form-input profile-form-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your video..."
              rows={4}
              maxLength={2000}
            />
            <div className="profile-form-char-count">{form.description.length}/2000</div>
          </div>

          <div className="profile-form-row">
            <div className="profile-form-group">
              <label className="profile-form-label" htmlFor="edit-category">Category</label>
              <select
                id="edit-category"
                className="profile-form-input profile-form-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                aria-label="Select category"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} style={{ background: '#16161f' }}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label" htmlFor="edit-thumbnail">Thumbnail URL</label>
              <input
                id="edit-thumbnail"
                className="profile-form-input"
                value={form.thumbnailUrl}
                onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                placeholder="https://..."
                type="url"
              />
            </div>
          </div>

          <div className="profile-form-group">
            <label className="profile-form-label" htmlFor="edit-thumbnail-file">Custom Thumbnail File</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                id="edit-thumbnail-file"
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                className="profile-form-input"
                style={{ flex: 1, padding: '9px 12px' }}
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              />
              {thumbnailFile && (
                <button
                  type="button"
                  onClick={() => { setThumbnailFile(null); if (thumbInputRef.current) thumbInputRef.current.value = ''; }}
                  style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="sv-alert sv-alert-danger" role="alert" aria-live="assertive" style={{ marginBottom: 14 }}>
              <span aria-hidden="true">❌</span> {error}
            </div>
          )}

          <div className="profile-modal-actions">
            <button
              type="button"
              id="cancel-edit-btn"
              className="sv-btn sv-btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-edit-btn"
              className="sv-btn sv-btn-primary"
              disabled={loading}
              aria-label="Save changes"
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="sv-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} aria-hidden="true" />
                  Saving…
                </span>
              ) : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---- Profile Page ---- */
function Profile() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingVideo, setEditingVideo] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // videoId being deleted
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const [profileRes, videosRes] = await Promise.all([
          api.get('/auth/profile'),
          api.get('/videos/my-videos'),
        ]);
        setUser(profileRes.data?.user || null);
        setVideos(Array.isArray(videosRes.data) ? videosRes.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSaved = (updatedVideo) => {
    setVideos((prev) => prev.map((v) => (v._id === updatedVideo._id ? updatedVideo : v)));
    showSuccess('Video updated successfully!');
  };

  const handleDelete = async (videoId) => {
    setDeletingId(videoId);
    try {
      await api.delete(`/videos/${videoId}`);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      setDeleteConfirm(null);
      showSuccess('Video deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const totalViews = videos.reduce((sum, v) => sum + Number(v.views || 0), 0);

  if (loading) {
    return (
      <div className="loading-center page-content" role="status" aria-live="polite">
        <div className="sv-spinner" aria-hidden="true" />
        <p className="loading-text">Loading your profile…</p>
      </div>
    );
  }

  return (
    <main className="page-content profile-page" role="main">
      {/* Edit Modal */}
      {editingVideo && (
        <EditModal
          video={editingVideo}
          onClose={() => setEditingVideo(null)}
          onSave={handleSaved}
        />
      )}

      {/* Alerts */}
      {error && (
        <div className="sv-alert sv-alert-danger animate-fade-up" role="alert" aria-live="assertive">
          <span aria-hidden="true">❌</span> {error}
        </div>
      )}
      {successMsg && (
        <div className="sv-alert sv-alert-success animate-fade-up" role="status" aria-live="polite">
          <span aria-hidden="true">✅</span> {successMsg}
        </div>
      )}

      {/* Profile Hero Card */}
      <div className="profile-hero animate-fade-up">
        <div className="profile-hero-left">
          <div className="profile-big-avatar" aria-label={`Avatar for ${user?.name}`} role="img">
            {initials}
          </div>
          <div>
            <h1 className="profile-name">{user?.name || 'Your Profile'}</h1>
            <p className="profile-email">{user?.email}</p>
            <span className={`profile-role-badge${user?.role === 'admin' ? ' admin' : ''}`}>
              {user?.role === 'admin' ? '🛡 Admin' : '👤 Member'}
            </span>
          </div>
        </div>
        <div className="profile-hero-stats">
          <div className="profile-stat">
            <div className="profile-stat-value">{videos.length}</div>
            <div className="profile-stat-label">Videos</div>
          </div>
          <div className="profile-stat-divider" aria-hidden="true" />
          <div className="profile-stat">
            <div className="profile-stat-value">{formatViews(totalViews)}</div>
            <div className="profile-stat-label">Total Views</div>
          </div>
          <div className="profile-stat-divider" aria-hidden="true" />
          <div className="profile-stat">
            <div className="profile-stat-value">
              {videos.reduce((sum, v) => sum + Number(v.likes || 0), 0)}
            </div>
            <div className="profile-stat-label">Likes</div>
          </div>
        </div>
      </div>

      {/* Videos Section */}
      <section className="animate-fade-up stagger-1" aria-label="My uploaded videos">
        <div className="profile-section-header">
          <div>
            <h2 className="section-title">
              🎬 My Videos
              <span className="section-title-pill">{videos.length}</span>
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              Manage, edit, and delete your uploaded content.
            </p>
          </div>
          <Link
            to="/upload"
            id="profile-upload-btn"
            className="sv-btn sv-btn-primary"
            aria-label="Upload new video"
          >
            ⬆️ Upload Video
          </Link>
        </div>

        {videos.length === 0 ? (
          <div className="empty-state" role="status">
            <div className="empty-state-icon" aria-hidden="true">🎬</div>
            <p className="empty-state-title">No videos yet</p>
            <p className="empty-state-sub">Upload your first video to see it here.</p>
            <Link
              to="/upload"
              className="sv-btn sv-btn-primary"
              style={{ marginTop: 20, display: 'inline-flex' }}
            >
              ⬆️ Upload a Video
            </Link>
          </div>
        ) : (
          <div className="profile-videos-grid" role="list">
            {videos.map((video) => (
              <div
                key={video._id}
                className="profile-video-card animate-fade-up"
                role="listitem"
                id={`my-video-${video._id}`}
              >
                {/* Thumbnail */}
                <div className="profile-video-thumb-wrap">
                  <Link to={`/watch/${video._id}`} aria-label={`Watch ${video.title}`} tabIndex={-1}>
                    <img
                      className="profile-video-thumb"
                      src={video.thumbnailUrl || `https://picsum.photos/seed/${video._id}/400/225`}
                      alt={video.title}
                      loading="lazy"
                      onError={(e) => { e.target.src = `https://picsum.photos/seed/${video._id}/400/225`; }}
                    />
                  </Link>

                  {/* Category chip */}
                  <span className="profile-video-category">{video.category || 'General'}</span>
                </div>

                {/* Info */}
                <div className="profile-video-info">
                  <Link
                    to={`/watch/${video._id}`}
                    className="profile-video-title"
                    aria-label={`Watch ${video.title}`}
                  >
                    {video.title}
                  </Link>

                  <p className="profile-video-desc">
                    {video.description
                      ? video.description.slice(0, 100) + (video.description.length > 100 ? '…' : '')
                      : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No description</span>}
                  </p>

                  <div className="profile-video-stats">
                    <span>👁 {formatViews(video.views)} views</span>
                    <span className="yt-dot">•</span>
                    <span>❤️ {video.likes || 0}</span>
                    <span className="yt-dot">•</span>
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="profile-video-actions">
                  <button
                    id={`edit-btn-${video._id}`}
                    className="profile-action-btn edit"
                    onClick={() => setEditingVideo(video)}
                    aria-label={`Edit ${video.title}`}
                  >
                    ✏️ Edit
                  </button>

                  {deleteConfirm === video._id ? (
                    <div className="profile-delete-confirm" role="alert">
                      <span style={{ fontSize: 12, color: '#f87171' }}>Delete?</span>
                      <button
                        id={`confirm-delete-btn-${video._id}`}
                        className="profile-action-btn danger"
                        onClick={() => handleDelete(video._id)}
                        disabled={deletingId === video._id}
                        aria-label="Confirm delete"
                      >
                        {deletingId === video._id ? '…' : 'Yes'}
                      </button>
                      <button
                        id={`cancel-delete-btn-${video._id}`}
                        className="profile-action-btn"
                        onClick={() => setDeleteConfirm(null)}
                        aria-label="Cancel delete"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`delete-btn-${video._id}`}
                      className="profile-action-btn danger"
                      onClick={() => setDeleteConfirm(video._id)}
                      aria-label={`Delete ${video.title}`}
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Profile;
