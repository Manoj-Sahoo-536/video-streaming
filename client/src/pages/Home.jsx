import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import VideoCard from '../components/VideoCard';

function Home() {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data } = await api.get('/videos');
        setVideos(data);
      } catch (_error) {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesSearch = `${video.title} ${video.category}`
        .toLowerCase()
        .includes(search.toLowerCase().trim());
      const matchesCategory = categoryFilter === 'All' || (video.category || 'General') === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [videos, search, categoryFilter]);

  const categories = useMemo(() => {
    const values = videos.map((video) => video.category || 'General');
    return ['All', ...new Set(values)];
  }, [videos]);

  return (
    <div className="home-page">
      <div className="home-hero card border-0 shadow-sm mb-3">
        <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h4 className="mb-1">Discover Videos</h4>
            <p className="text-muted mb-0">Browse, search, and watch content from your library.</p>
          </div>
          <div className="d-flex gap-2">
            <span className="badge text-bg-primary px-3 py-2">Total: {videos.length}</span>
            <span className="badge text-bg-light border px-3 py-2">Showing: {filteredVideos.length}</span>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-lg-5">
              <input
                className="form-control"
                placeholder="Search by title or category"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="col-lg-7">
              <div className="d-flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`btn btn-sm ${categoryFilter === category ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setCategoryFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="row g-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="col-sm-6 col-lg-4" key={`loading-${index}`}>
              <div className="video-card h-100 placeholder-glow p-3">
                <div className="video-thumb rounded placeholder" />
                <div className="mt-3">
                  <span className="placeholder col-8 d-block mb-2" />
                  <span className="placeholder col-5 d-block mb-2" />
                  <span className="placeholder col-4 d-block" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <h6 className="mb-2">No videos found</h6>
            <p className="text-muted mb-0">Try changing search text or selecting another category.</p>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {filteredVideos.map((video) => (
            <div className="col-sm-6 col-lg-4" key={video._id}>
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
