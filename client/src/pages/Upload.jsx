import { useRef, useState } from 'react';
import api from '../api/axios';

const CATEGORIES = [
  'General', 'Music', 'Gaming', 'Education', 'Technology',
  'Sports', 'Comedy', 'News', 'Travel', 'Food', 'Fitness',
];

function Upload() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'General',
    videoUrl: '',
    duration: '',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    }
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!videoFile && !form.videoUrl.trim()) {
      setError('Please select a video file or provide a video URL.');
      return;
    }

    setLoading(true);
    setProgress(10);

    const payload = new FormData();
    payload.append('title', form.title);
    payload.append('description', form.description);
    payload.append('category', form.category);
    payload.append('duration', String(Number(form.duration || 0)));

    if (videoFile) payload.append('video', videoFile);
    if (thumbnailFile) payload.append('thumbnail', thumbnailFile);
    if (form.videoUrl.trim()) payload.append('videoUrl', form.videoUrl.trim());

    try {
      await api.post('/videos/upload', payload, {
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 85) / e.total);
          setProgress(10 + percent);
        },
      });

      setProgress(100);
      setMessage('🎉 Video uploaded successfully! It will appear in the library shortly.');
      setForm({ title: '', description: '', category: 'General', videoUrl: '', duration: '' });
      setVideoFile(null);
      setThumbnailFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (thumbInputRef.current) thumbInputRef.current.value = '';
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <main className="page-content upload-page" role="main">
      {/* Hero */}
      <div className="upload-hero animate-fade-up">
        <div className="upload-hero-icon" aria-hidden="true">⬆️</div>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Upload a Video
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Share your content with the StreamVault community.
          </p>
        </div>
      </div>

      <div className="upload-card animate-fade-up stagger-1">
        <form id="upload-form" onSubmit={submitHandler} aria-label="Upload video form">
          {/* Drop Zone */}
          <div
            id="upload-drop-zone"
            className={`upload-drop-zone${dragOver ? ' drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            role="region"
            aria-label="Video file drop zone"
            aria-describedby="drop-zone-help"
          >
            <input
              id="video-file-input"
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="upload-file-input"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              aria-label="Select video file"
            />
            <span className="upload-drop-icon" aria-hidden="true">🎬</span>
            <div className="upload-drop-title">
              Drag & drop your video here
            </div>
            <div className="upload-drop-sub" id="drop-zone-help">
              or <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>click to browse</span> — MP4, WebM, MOV supported
            </div>
          </div>

          {/* Selected file indicator */}
          {videoFile && (
            <div className="upload-selected-file animate-fade-up" role="status" aria-live="polite">
              <span className="upload-file-icon" aria-hidden="true">✅</span>
              <span className="upload-file-name">{videoFile.name}</span>
              <span style={{ fontSize: 12, color: '#34d399', flexShrink: 0 }}>
                {(videoFile.size / 1_048_576).toFixed(1)} MB
              </span>
              <button
                type="button"
                onClick={() => { setVideoFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                aria-label="Remove selected file"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}
              >
                ✕
              </button>
            </div>
          )}

          <div style={{ height: 24 }} />

          {/* Title */}
          <div className="form-group">
            <label className="upload-form-label" htmlFor="upload-title">Video Title *</label>
            <input
              id="upload-title"
              className="upload-input"
              placeholder="Give your video an awesome title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              aria-required="true"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="upload-form-label" htmlFor="upload-description">Description</label>
            <textarea
              id="upload-description"
              className="upload-input upload-textarea"
              placeholder="What is your video about? Add tags, links, credits..."
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Category + Duration row */}
          <div className="form-row">
            <div className="form-group">
              <label className="upload-form-label" htmlFor="upload-category">Category</label>
              <select
                id="upload-category"
                className="upload-input upload-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                aria-label="Select video category"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} style={{ background: '#16161f' }}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="upload-form-label" htmlFor="upload-duration">Duration (seconds)</label>
              <input
                id="upload-duration"
                className="upload-input"
                type="number"
                min="0"
                placeholder="e.g. 180"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                aria-label="Video duration in seconds"
              />
            </div>
          </div>

          {/* Custom Thumbnail */}
          <div className="form-group">
            <label className="upload-form-label" htmlFor="upload-thumbnail">
              Custom Thumbnail <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                id="upload-thumbnail"
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                className="upload-input"
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

          {/* Optional URL */}
          <div className="form-group">
            <label className="upload-form-label" htmlFor="upload-url">
              Video URL <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(optional — for pre-hosted videos)</span>
            </label>
            <input
              id="upload-url"
              className="upload-input"
              type="url"
              placeholder="https://example.com/video.mp4"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              aria-label="Video URL (optional)"
            />
          </div>

          {/* Status messages */}
          {message && (
            <div className="sv-alert sv-alert-success animate-fade-up" role="status" aria-live="polite">
              {message}
            </div>
          )}
          {error && (
            <div className="sv-alert sv-alert-danger animate-fade-up" role="alert" aria-live="assertive">
              <span aria-hidden="true">❌</span> {error}
            </div>
          )}

          {/* Progress bar */}
          {loading && progress > 0 && (
            <div className="upload-progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
              <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <button
              id="upload-submit-btn"
              type="submit"
              className="upload-submit-btn"
              disabled={loading}
              aria-label={loading ? 'Uploading...' : 'Submit upload'}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      display: 'inline-block', animation: 'spin 0.7s linear infinite',
                    }}
                    aria-hidden="true"
                  />
                  Uploading… {progress}%
                </>
              ) : (
                <>⬆️ Upload Video</>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default Upload;
