const { supabaseAdminClient } = require('../config/supabase');

const getUsers = async (_req, res) => {
  try {
    const { data: users, error } = await supabaseAdminClient
      .from('users')
      .select('id, name, email, profile_pic_url, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json(
      (users || []).map((user) => ({
        _id: user.id,
        name: user.name,
        email: user.email,
        profilePic: user.profile_pic_url || '',
        role: user.role,
        createdAt: user.created_at
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getWatchHistory = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { data: history, error } = await supabaseAdminClient
      .from('watch_history')
      .select('id, user_id, video_id, watched_at, videos:video_id(*)')
      .eq('user_id', userId)
      .order('watched_at', { ascending: false })
      .limit(50);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json(
      (history || []).map((item) => ({
        _id: item.id,
        userId: item.user_id,
        videoId: item.video_id,
        watchedAt: item.watched_at,
        video: item.videos
          ? {
              _id: item.videos.id,
              title: item.videos.title,
              description: item.videos.description,
              videoUrl: item.videos.video_url,
              thumbnailUrl: item.videos.thumbnail_url,
              duration: Number(item.videos.duration || 0),
              views: Number(item.videos.views || 0),
              likes: Number(item.videos.likes || 0),
              category: item.videos.category,
              uploadedBy: item.videos.uploaded_by,
              createdAt: item.videos.created_at
            }
          : null
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAnalytics = async (_req, res) => {
  try {
    const [
      { count: totalUsers, error: usersError },
      { count: totalVideos, error: videosError },
      { data: videos, error: viewsError }
    ] = await Promise.all([
      supabaseAdminClient.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdminClient.from('videos').select('*', { count: 'exact', head: true }),
      supabaseAdminClient.from('videos').select('views')
    ]);

    if (usersError || videosError || viewsError) {
      return res.status(500).json({
        message: usersError?.message || videosError?.message || viewsError?.message
      });
    }

    const totalViews = (videos || []).reduce((sum, video) => sum + Number(video.views || 0), 0);

    return res.status(200).json({
      totalUsers: totalUsers || 0,
      totalVideos: totalVideos || 0,
      totalViews
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getWatchHistory,
  getAnalytics
};
