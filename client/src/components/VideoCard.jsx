import { Link } from 'react-router-dom';

const CATEGORY_ICONS = {
  Music: '🎵', Gaming: '🎮', Education: '📚', Technology: '💻',
  Sports: '⚽', Comedy: '😂', News: '📰', Travel: '✈️',
  Food: '🍕', Fitness: '💪', General: '🎬',
};

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return null;
  const total = Math.floor(Number(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function formatViews(views) {
  const v = Number(views || 0);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
}

function VideoCard({ video }) {
  const uploaderName = video?.uploadedBy?.name || 'Creator';
  const category = video?.category || 'General';
  const duration = formatDuration(video?.duration);
  const views = formatViews(video?.views);
  const dateStr = formatDate(video?.createdAt);
  const thumbnail = video?.thumbnailUrl || `https://picsum.photos/seed/${video?._id || 'video'}/600/340`;

  // Generate avatar initials & color
  const initials = uploaderName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarColors = [
    '#7c3aed', '#a855f7', '#ec4899', '#06b6d4',
    '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
  ];
  const colorIndex = uploaderName.charCodeAt(0) % avatarColors.length;
  const avatarBg = avatarColors[colorIndex];

  return (
    <Link
      to={`/watch/${video._id}`}
      className="yt-card"
      aria-label={`Watch ${video.title}`}
      id={`video-card-${video._id}`}
    >
      {/* Thumbnail */}
      <div className="yt-thumb-wrap">
        <img
          className="yt-thumb"
          src={thumbnail}
          alt={video.title}
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/${video?._id}/600/340`;
          }}
        />
        {/* Duration */}
        {duration && (
          <span className="yt-duration" aria-label={`Duration: ${duration}`}>
            {duration}
          </span>
        )}
        {/* Hover play shimmer */}
        <div className="yt-hover-overlay" aria-hidden="true" />
      </div>

      {/* Meta row */}
      <div className="yt-meta">
        {/* Avatar */}
        <div
          className="yt-avatar"
          style={{ background: avatarBg }}
          aria-label={`${uploaderName}'s channel`}
          role="img"
        >
          {initials}
        </div>

        {/* Info */}
        <div className="yt-info">
          <h3 className="yt-title" title={video.title}>{video.title}</h3>
          <div className="yt-author">{uploaderName}</div>
          <div className="yt-stats">
            <span>{formatViews(video?.views)} views</span>
            {dateStr && <><span className="yt-dot">•</span><span>{dateStr}</span></>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default VideoCard;
