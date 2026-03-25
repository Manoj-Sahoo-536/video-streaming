const { supabaseAdminClient } = require('../config/supabase');

const getPlaylists = async (req, res) => {
  try {
    const { data: playlists, error } = await supabaseAdminClient
      .from('playlists')
      .select('id, name, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    if (!playlists?.length) {
      return res.status(200).json([]);
    }

    const playlistIds = playlists.map((item) => item.id);

    const { data: playlistVideos, error: videosError } = await supabaseAdminClient
      .from('playlist_videos')
      .select('playlist_id, videos:video_id(*, users:uploaded_by(name))')
      .in('playlist_id', playlistIds)
      .order('created_at', { ascending: false });

    if (videosError) {
      return res.status(500).json({ message: videosError.message });
    }

    const grouped = new Map();

    (playlistVideos || []).forEach((row) => {
      const list = grouped.get(row.playlist_id) || [];
      if (row.videos) {
        list.push({
          _id: row.videos.id,
          title: row.videos.title,
          description: row.videos.description,
          videoUrl: row.videos.video_url,
          thumbnailUrl: row.videos.thumbnail_url,
          duration: Number(row.videos.duration || 0),
          views: Number(row.videos.views || 0),
          likes: Number(row.videos.likes || 0),
          category: row.videos.category,
          uploadedBy: {
            _id: row.videos.uploaded_by,
            name: row.videos.users?.name || 'User'
          },
          createdAt: row.videos.created_at
        });
      }
      grouped.set(row.playlist_id, list);
    });

    return res.status(200).json(
      playlists.map((playlist) => ({
        _id: playlist.id,
        name: playlist.name,
        createdAt: playlist.created_at,
        videos: grouped.get(playlist.id) || []
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createPlaylist = async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();

    if (!name) {
      return res.status(400).json({ message: 'Playlist name is required' });
    }

    const { data: created, error } = await supabaseAdminClient
      .from('playlists')
      .insert({
        user_id: req.user.id,
        name
      })
      .select('id, name, created_at')
      .single();

    if (error) {
      const isDuplicate = error.code === '23505' || String(error.message || '').toLowerCase().includes('duplicate key');
      if (isDuplicate) {
        return res.status(409).json({ message: 'Playlist with this name already exists' });
      }
      return res.status(500).json({ message: error.message });
    }

    return res.status(201).json({
      _id: created.id,
      name: created.name,
      createdAt: created.created_at,
      videos: []
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addVideoToPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ message: 'videoId is required' });
    }

    const { data: playlist, error: playlistError } = await supabaseAdminClient
      .from('playlists')
      .select('id, user_id')
      .eq('id', id)
      .maybeSingle();

    if (playlistError) {
      return res.status(500).json({ message: playlistError.message });
    }

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const { data: video, error: videoError } = await supabaseAdminClient
      .from('videos')
      .select('id')
      .eq('id', videoId)
      .maybeSingle();

    if (videoError) {
      return res.status(500).json({ message: videoError.message });
    }

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const { error: insertError } = await supabaseAdminClient
      .from('playlist_videos')
      .insert({
        playlist_id: id,
        video_id: videoId
      });

    if (insertError) {
      const isDuplicate = insertError.code === '23505' || String(insertError.message || '').toLowerCase().includes('duplicate key');
      if (isDuplicate) {
        return res.status(200).json({ message: 'Video already exists in this playlist', added: false });
      }
      return res.status(500).json({ message: insertError.message });
    }

    return res.status(201).json({ message: 'Video added to playlist', added: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPlaylists,
  createPlaylist,
  addVideoToPlaylist
};
