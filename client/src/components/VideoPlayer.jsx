import { useMemo } from 'react';

const getYouTubeId = (url) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{6,})/i);
  return match?.[1] || null;
};

const getVimeoId = (url) => {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return match?.[1] || null;
};

const getGoogleDriveId = (url) => {
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (fileMatch?.[1]) return fileMatch[1];
  const openMatch = url.match(/[?&]id=([^&]+)/i);
  return openMatch?.[1] || null;
};

const getEmbedSource = (url) => {
  if (!url) return '';

  const youTubeId = getYouTubeId(url);
  if (youTubeId) {
    return `https://www.youtube.com/embed/${youTubeId}`;
  }

  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}`;
  }

  if (/drive\.google\.com/i.test(url)) {
    const driveId = getGoogleDriveId(url);
    if (driveId) {
      return `https://drive.google.com/file/d/${driveId}/preview`;
    }
  }

  return '';
};

const getPlayableSource = (url) => {
  if (!url) return '';

  if (/dropbox\.com/i.test(url)) {
    return url
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace(/[?&]dl=0/gi, '')
      .replace(/[?&]dl=1/gi, '');
  }

  return url;
};

function VideoPlayer({ streamUrl, thumbnailUrl, onPlayStart }) {
  const source = useMemo(() => getPlayableSource(streamUrl || ''), [streamUrl]);
  const embedSource = useMemo(() => getEmbedSource(source), [source]);

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
      {embedSource ? (
        <iframe
          id="main-video-player"
          src={embedSource}
          title="Video player"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          style={{
            width: '100%',
            height: 520,
            border: 'none',
            background: '#000',
            display: 'block',
            borderRadius: 'var(--radius-md)',
          }}
        />
      ) : (
        <video
          id="main-video-player"
          controls
          poster={thumbnailUrl}
          preload="metadata"
          onPlay={onPlayStart}
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
      )}
    </div>
  );
}

export default VideoPlayer;
