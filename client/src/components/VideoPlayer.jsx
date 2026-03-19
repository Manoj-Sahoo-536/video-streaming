import { useMemo } from 'react';

function VideoPlayer({ streamUrl, thumbnailUrl }) {
  const source = useMemo(() => streamUrl || '', [streamUrl]);

  if (!source) {
    return <div className="alert alert-secondary">No stream URL available</div>;
  }

  return (
    <video
      controls
      poster={thumbnailUrl}
      style={{ width: '100%', maxHeight: 520, background: 'black', borderRadius: 10 }}
    >
      <source src={source} />
      Your browser does not support video playback.
    </video>
  );
}

export default VideoPlayer;
