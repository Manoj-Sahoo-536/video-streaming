import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import VideoPlayer from '../components/VideoPlayer';

function formatViews(v) {
  const n = Number(v || 0);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [stream, setStream] = useState({ streamUrl: '', thumbnailUrl: '' });
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeError, setLikeError] = useState('');
  const [descExpanded, setDescExpanded] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const viewTrackedRef = useRef(false);

  const token = localStorage.getItem('token');

  const getOrCreateViewerSessionId = () => {
    const key = 'viewer_session_id';
    const existing = localStorage.getItem(key);
    if (existing && existing.trim()) return existing;

    const generated = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(key, generated);
    return generated;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      viewTrackedRef.current = false;
      try {
        const videoRes = await api.get(`/videos/${id}`);

        setVideo(videoRes.data);
        setStream({
          streamUrl: videoRes.data?.videoUrl || '',
          thumbnailUrl: videoRes.data?.thumbnailUrl || ''
        });
        setLikes(Number(videoRes.data?.likes || 0));
        setComments([]);
        setLiked(false);

        try {
          const commentsRes = await api.get(`/videos/comments/${id}`);
          setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
        } catch (_) {
          setComments([]);
        }

        if (token) {
          try {
            const likeStatusRes = await api.get(`/videos/${id}/like-status`);
            if (likeStatusRes?.data) {
              setLiked(Boolean(likeStatusRes.data.liked));
              setLikes(Number(likeStatusRes.data.likes || videoRes.data?.likes || 0));
            }
          } catch (_) {
            setLiked(false);
          }
        }

        // Fetch related videos
        const allRes = await api.get('/videos');
        const all = Array.isArray(allRes.data) ? allRes.data : [];
        setRelatedVideos(all.filter((v) => v._id !== id).slice(0, 8));
      } catch (_err) {
        setVideo(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    window.scrollTo(0, 0);
  }, [id]);

  const submitComment = async (event) => {
    event.preventDefault();
    if (!token || !commentText.trim()) return;
    setCommentLoading(true);
    try {
      await api.post('/videos/comments', { videoId: id, comment: commentText });
      const { data } = await api.get(`/videos/comments/${id}`);
      setComments(data);
      setCommentText('');
    } catch (_err) {
      // silently fail
    } finally {
      setCommentLoading(false);
    }
  };

  const handleLike = async () => {
    if (!token || likeLoading) return;

    const previousLiked = liked;
    const previousLikes = likes;
    const nextLiked = !previousLiked;
    const nextLikes = Math.max(0, previousLikes + (nextLiked ? 1 : -1));
    const action = nextLiked ? 'like' : 'unlike';

    setLiked(nextLiked);
    setLikes(nextLikes);
    setLikeLoading(true);
    setLikeError('');

    try {
      const { data } = await api.post(`/videos/${id}/like`, { action });
      if (typeof data?.liked === 'boolean') {
        setLiked(Boolean(data.liked));
      }
      if (typeof data?.likes === 'number') {
        setLikes(Number(data.likes));
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to update like. Please try again.';
      setLikeError(message);
      setLiked(previousLiked);
      setLikes(previousLikes);

      if (token) {
        try {
          const statusRes = await api.get(`/videos/${id}/like-status`);
          setLiked(Boolean(statusRes?.data?.liked));
          setLikes(Number(statusRes?.data?.likes || 0));
        } catch (_) {
          // no-op
        }
      }
    } finally {
      setLikeLoading(false);
    }
  };

  const trackViewOnPlay = async () => {
    if (viewTrackedRef.current) return;
    viewTrackedRef.current = true;

    try {
      const { data } = await api.post(`/videos/${id}/view`, {
        sessionId: getOrCreateViewerSessionId()
      });

      if (typeof data?.views === 'number') {
        setVideo((prev) => (prev ? { ...prev, views: data.views } : prev));
      }
    } catch (_) {
      // silently fail
    }
  };

  if (loading) {
    return (
      <div className="loading-center" role="status" aria-live="polite">
        <div className="sv-spinner" aria-hidden="true" />
        <p className="loading-text">Loading video...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="empty-state page-content" role="alert">
        <div className="empty-state-icon" aria-hidden="true">🎬</div>
        <p className="empty-state-title">Video not found</p>
        <p className="empty-state-sub">This video may have been deleted or doesn't exist.</p>
        <Link
          to="/"
          className="sv-btn sv-btn-primary"
          style={{ marginTop: 20, display: 'inline-flex' }}
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  const description = video.description || 'No description provided.';
  const isLongDesc = description.length > 180;

  return (
    <main className="page-content" role="main">
      <div className="watch-layout">
        {/* LEFT COLUMN */}
        <div>
          {/* Player */}
          <VideoPlayer
            streamUrl={stream.streamUrl}
            thumbnailUrl={stream.thumbnailUrl}
            onPlayStart={trackViewOnPlay}
          />

          {/* Video Info */}
          <div className="watch-info">
            <h1 className="watch-title">{video.title}</h1>

            {/* Meta bar */}
            <div className="watch-meta-info">
              <div className="watch-channel-info">
                <div className="watch-channel-avatar">
                   <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${video.uploadedBy?.name || 'Creator'}`} alt="Avatar" />
                </div>
                <div className="watch-channel-text">
                  <div className="watch-channel-name">{video.uploadedBy?.name || 'Creator'}</div>
                  <div className="watch-channel-stats">
                    {formatViews(video.views)} views • {new Date(video.createdAt || Date.now()).toLocaleDateString('en-US')}
                  </div>
                </div>
              </div>

              <div className="watch-action-btns">
                <button
                  id="like-btn"
                  className={`watch-action-pill${liked ? ' active' : ''}`}
                  onClick={handleLike}
                  aria-pressed={liked}
                  aria-label={liked ? 'Unlike video' : 'Like video'}
                  disabled={!token || likeLoading}
                  title={!token ? 'Login to like' : ''}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                  <span>{likes > 0 ? likes : 'Like'}</span>
                </button>
                {likeError ? (
                  <span style={{ color: 'var(--danger)', fontSize: 12, marginLeft: 8 }} role="status" aria-live="polite">
                    {likeError}
                  </span>
                ) : null}
                <button
                  id="share-btn"
                  className="watch-action-pill"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: video.title, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied!');
                    }
                  }}
                  aria-label="Share video"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="watch-description-box">
              <p
                className="watch-description-text"
                style={{
                  maxHeight: descExpanded ? 'none' : '72px',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                }}
              >
                {description}
              </p>
              {isLongDesc && (
                <button
                  id="desc-expand-btn"
                  style={{
                    background: 'none', border: 'none', color: 'var(--accent-secondary)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '6px 0 0',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onClick={() => setDescExpanded((p) => !p)}
                  aria-expanded={descExpanded}
                >
                  {descExpanded ? '▲ Show less' : '▼ Show more'}
                </button>
              )}
            </div>

            {/* Comments */}
            <section aria-label="Comments section">
              <h2 className="comments-section-title">
                <span aria-hidden="true">💬</span>
                Comments
                <span className="section-title-pill">{comments.length}</span>
              </h2>

              {token ? (
                <form
                  id="comment-form"
                  className="comment-form"
                  onSubmit={submitComment}
                  aria-label="Post a comment"
                >
                  <input
                    id="comment-input"
                    className="comment-input"
                    placeholder="Share your thoughts..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    aria-label="Comment text"
                    maxLength={500}
                  />
                  <button
                    id="comment-submit-btn"
                    type="submit"
                    className="comment-submit-btn"
                    disabled={commentLoading || !commentText.trim()}
                    aria-label="Submit comment"
                  >
                    {commentLoading ? '...' : 'Post'}
                  </button>
                </form>
              ) : (
                <div className="sv-alert sv-alert-info" style={{ marginBottom: 16 }}>
                  <span aria-hidden="true">🔐</span>
                  <span><Link to="/login" className="auth-link">Login</Link> to post a comment.</span>
                </div>
              )}

              <div role="list" aria-label="Comment list">
                {comments.length === 0 ? (
                  <div className="watch-description-text" style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                    No comments yet. Be the first to share your thoughts!
                  </div>
                ) : (
                  comments.map((comment) => {
                    const name = comment.userId?.name || 'User';
                    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                    return (
                      <div
                        key={comment._id}
                        className="comment-item"
                        role="listitem"
                      >
                        <div className="comment-avatar" aria-hidden="true">{initials}</div>
                        <div className="comment-content">
                          <div className="comment-author">{name}</div>
                          <div className="comment-text">{comment.comment}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </div>

        {/* RIGHT COLUMN — Recommendations */}
        <aside className="recommendations-panel" aria-label="Recommended videos">
          <div className="recommendations-title">Up Next</div>
          {relatedVideos.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No recommendations available.</div>
          ) : (
            relatedVideos.map((rv) => (
              <Link
                key={rv._id}
                to={`/watch/${rv._id}`}
                className="rec-card"
                aria-label={`Watch ${rv.title}`}
              >
                <img
                  className="rec-thumb"
                  src={rv.thumbnailUrl || `https://picsum.photos/seed/${rv._id}/200/120`}
                  alt={rv.title}
                  loading="lazy"
                  onError={(e) => { e.target.src = `https://picsum.photos/seed/${rv._id}/200/120`; }}
                />
                <div className="rec-info">
                  <div className="rec-title">{rv.title}</div>
                  <div className="rec-meta">
                    {rv.uploadedBy?.name || 'Creator'} · {formatViews(rv.views)} views
                  </div>
                </div>
              </Link>
            ))
          )}
        </aside>
      </div>
    </main>
  );
}

export default Watch;
