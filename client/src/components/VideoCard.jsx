import { Link } from 'react-router-dom';

function VideoCard({ video }) {
  const uploaderName = video?.uploadedBy?.name || 'Creator';

  return (
    <div className="video-card h-100 d-flex flex-column">
      <img
        className="video-thumb"
        src={video.thumbnailUrl || 'https://placehold.co/600x340?text=Video+Thumbnail'}
        alt={video.title}
      />
      <div className="p-3 d-flex flex-column flex-grow-1">
        <div className="mb-2 d-flex justify-content-between align-items-center gap-2">
          <span className="badge text-bg-light border">{video.category || 'General'}</span>
          <small className="text-muted">{video.views || 0} views</small>
        </div>
        <h6 className="mb-2 line-clamp-2">{video.title}</h6>
        <small className="text-muted mb-3">By {uploaderName}</small>
        <Link className="btn btn-sm btn-primary mt-auto" to={`/watch/${video._id}`}>
          Watch
        </Link>
      </div>
    </div>
  );
}

export default VideoCard;
