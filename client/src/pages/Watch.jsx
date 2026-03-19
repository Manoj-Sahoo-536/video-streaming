import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import VideoPlayer from '../components/VideoPlayer';

function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [stream, setStream] = useState({ streamUrl: '', thumbnailUrl: '' });
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [videoRes, streamRes, commentsRes] = await Promise.all([
          api.get(`/videos/${id}`),
          api.get(`/videos/stream/${id}`),
          api.get(`/videos/comments/${id}`)
        ]);

        setVideo(videoRes.data);
        setStream(streamRes.data);
        setComments(commentsRes.data);
      } catch (_error) {
        setVideo(null);
      }
    };

    loadData();
  }, [id]);

  const submitComment = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');

    if (!token || !commentText.trim()) {
      return;
    }

    try {
      await api.post('/videos/comments', { videoId: id, comment: commentText });
      const { data } = await api.get(`/videos/comments/${id}`);
      setComments(data);
      setCommentText('');
    } catch (_error) {
    }
  };

  if (!video) {
    return <div className="alert alert-warning">Video not found</div>;
  }

  return (
    <div>
      <h4 className="mb-3">{video.title}</h4>
      <VideoPlayer streamUrl={stream.streamUrl} thumbnailUrl={stream.thumbnailUrl} />
      <p className="mt-3 mb-1">{video.description}</p>
      <small className="text-muted">Category: {video.category || 'General'}</small>

      <hr />
      <h5>Comments</h5>
      <form className="d-flex gap-2 mb-3" onSubmit={submitComment}>
        <input
          className="form-control"
          placeholder="Add a comment"
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Post
        </button>
      </form>

      {comments.length === 0 ? (
        <div className="text-muted">No comments yet.</div>
      ) : (
        comments.map((comment) => (
          <div className="card mb-2" key={comment._id}>
            <div className="card-body py-2">
              <strong>{comment.userId?.name || 'User'}:</strong> {comment.comment}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Watch;
