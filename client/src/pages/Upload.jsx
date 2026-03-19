import { useState } from 'react';
import api from '../api/axios';

function Upload() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    videoUrl: '',
    duration: ''
  });
  const [videoFile, setVideoFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    if (!videoFile && !form.videoUrl.trim()) {
      setError('Please select a video file or provide a video URL');
      setLoading(false);
      return;
    }

    const payload = new FormData();
    payload.append('title', form.title);
    payload.append('description', form.description);
    payload.append('category', form.category);
    payload.append('duration', String(Number(form.duration || 0)));

    if (videoFile) {
      payload.append('video', videoFile);
    }

    if (form.videoUrl.trim()) {
      payload.append('videoUrl', form.videoUrl.trim());
    }

    try {
      await api.post('/videos/upload', payload);
      setMessage('Video uploaded successfully');
      setForm({ title: '', description: '', category: '', videoUrl: '', duration: '' });
      setVideoFile(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col-lg-8">
        <div className="card shadow-sm">
          <div className="card-body">
            <h4 className="mb-3">Upload Video</h4>
            <form onSubmit={submitHandler}>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  className="form-control"
                  required
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Category</label>
                  <input
                    className="form-control"
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Duration (seconds)</label>
                  <input
                    className="form-control"
                    type="number"
                    min="0"
                    value={form.duration}
                    onChange={(event) => setForm({ ...form, duration: event.target.value })}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Video File</label>
                <input
                  className="form-control"
                  type="file"
                  accept="video/*"
                  onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
                />
                <small className="text-muted">Upload from device (preferred for Cloudinary).</small>
              </div>

              <div className="mb-3">
                <label className="form-label">Video URL (Optional)</label>
                <input
                  className="form-control"
                  value={form.videoUrl}
                  onChange={(event) => setForm({ ...form, videoUrl: event.target.value })}
                />
                <small className="text-muted">Use this only if you want to save a pre-hosted video URL.</small>
              </div>

              {message && <div className="alert alert-success py-2">{message}</div>}
              {error && <div className="alert alert-danger py-2">{error}</div>}

              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Uploading...' : 'Submit Upload'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;
