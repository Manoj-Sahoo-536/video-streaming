import { useMemo } from 'react';

function VideoPlayer({ streamUrl, thumbnailUrl }) {
  const source = useMemo(() => streamUrl || '', [streamUrl]);

  if (!source) {
    return (
      <div
        className="sv-alert sv-alert-warning"
        role="alert"
        aria-live="polite"
        style={{ borderRadius: 'var(--radius-md)', margin: 0 }}
      >
        <span aria-hidden="true">⚠️</span>
        <span>No stream URL available for this video.</span>
      </div>
    );
  }

  return (
    <div className="watch-player-wrapper" role="region" aria-label="Video player">
      <video
        id="main-video-player"
        controls
        poster={thumbnailUrl}
        preload="metadata"
        aria-label="Video player"
        style={{
          width: '100%',
          maxHeight: 520,
          background: '#000',
          display: 'block',
        }}
      >
        <source src={source} />
        <p>Your browser does not support HTML5 video playback.</p>
      </video>
    </div>
  );
}

export default VideoPlayer;
