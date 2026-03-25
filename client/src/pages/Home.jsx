import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import VideoCard from '../components/VideoCard';

const CATEGORIES = ['All', 'Music', 'Gaming', 'Education', 'Technology', 'Sports', 'Comedy', 'News', 'Travel', 'Food', 'Fitness'];

function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-thumb" />
      <div style={{ padding: '14px 16px' }}>
        <div className="skeleton skeleton-text" style={{ width: '80%' }} />
        <div className="skeleton skeleton-text" style={{ width: '60%' }} />
        <div className="skeleton skeleton-text-sm skeleton" style={{ width: '40%' }} />
      </div>
    </div>
  );
}

function Home() {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  // Sync category from sidebar links (?cat=Gaming)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    const q = params.get('q');
    if (cat) setCategoryFilter(cat);
    if (q) setSearch(q);
  }, [location.search]);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/videos');
        setVideos(Array.isArray(data) ? data : []);
      } catch (_err) {
        setError('Failed to load videos. Please try again later.');
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesSearch = `${video.title || ''} ${video.category || ''} ${video.uploadedBy?.name || ''}`
        .toLowerCase()
        .includes(search.toLowerCase().trim());
      const matchesCategory = categoryFilter === 'All' || (video.category || 'General') === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [videos, search, categoryFilter]);

  const dynamicCategories = useMemo(() => {
    const cats = new Set(videos.map((v) => v.category || 'General'));
    return [...CATEGORIES.filter((c) => c === 'All' || cats.has(c)), ...[...cats].filter((c) => !CATEGORIES.includes(c))];
  }, [videos]);

  return (
    <main className="page-content" role="main" style={{ padding: '24px 32px' }}>
      {/* Category Tags Row */}
      <div className="home-category-tags" role="group" aria-label="Category filters">
        {dynamicCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`home-category-tag ${categoryFilter === cat ? 'active' : ''}`}
            onClick={() => setCategoryFilter(cat)}
            aria-pressed={categoryFilter === cat}
            aria-label={`Filter by ${cat}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="sv-alert sv-alert-danger animate-fade-up" role="alert" style={{ marginBottom: 24 }}>
          <span aria-hidden="true">❗</span> {error}
        </div>
      )}

      {/* Video Grid */}
      {loading ? (
        <div className="videos-grid" aria-label="Loading videos" aria-busy="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={`skel-${i}`} />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="empty-state animate-scale-in" role="status" aria-live="polite" style={{ marginTop: 40 }}>
          <div className="empty-state-icon" aria-hidden="true">🎬</div>
          <p className="empty-state-title">No videos found</p>
          <p className="empty-state-sub">
            {search ? `No results for "${search}". Try different keywords.` : 'No videos available yet.'}
          </p>
        </div>
      ) : (
        <section aria-label={`${filteredVideos.length} video results`}>
          <div className="videos-grid animate-fade-up">
            {filteredVideos.map((video, i) => (
              <div
                key={video._id}
                className={`stagger-${Math.min(i + 1, 4)}`}
              >
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default Home;
