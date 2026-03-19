const cloudinary = require('../config/cloudinary');
const { supabaseAdminClient } = require('../config/supabase');

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'video-streaming/videos',
        resource_type: 'video'
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });

const mapVideo = (video) => ({
  _id: video.id,
  title: video.title,
  description: video.description,
  videoUrl: video.video_url,
  thumbnailUrl: video.thumbnail_url,
  duration: Number(video.duration || 0),
  views: Number(video.views || 0),
  likes: Number(video.likes || 0),
  category: video.category,
  uploadedBy: {
    _id: video.uploaded_by,
    name: video.users?.name || 'User'
  },
  createdAt: video.created_at
});

const uploadVideo = async (req, res) => {
  try {
    const { title, description, category, videoUrl, thumbnailUrl, duration } = req.body;
    const hasFile = Boolean(req.file?.buffer);

    if (!title || (!videoUrl && !hasFile)) {
      return res.status(400).json({ message: 'Title and video file/url are required' });
    }

    let finalVideoUrl = videoUrl;
    let finalThumbnailUrl = thumbnailUrl || '';
    let finalDuration = Number(duration || 0);
    let cloudinaryVideoPublicId = null;

    if (hasFile) {
      const uploadedVideo = await uploadToCloudinary(req.file.buffer);
      finalVideoUrl = uploadedVideo.secure_url;
      finalDuration = Number(uploadedVideo.duration || finalDuration || 0);
      cloudinaryVideoPublicId = uploadedVideo.public_id;

      finalThumbnailUrl = cloudinary.url(uploadedVideo.public_id, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [{ width: 640, height: 360, crop: 'fill' }]
      });
    }

    const { data: createdVideo, error } = await supabaseAdminClient
      .from('videos')
      .insert({
        title,
        description: description || '',
        category: category || 'General',
        video_url: finalVideoUrl,
        thumbnail_url: finalThumbnailUrl,
        duration: finalDuration,
        uploaded_by: req.user.id,
        cloudinary_video_public_id: cloudinaryVideoPublicId
      })
      .select('*, users:uploaded_by(name)')
      .single();

    if (error) {
      if (cloudinaryVideoPublicId) {
        await cloudinary.uploader.destroy(cloudinaryVideoPublicId, { resource_type: 'video' });
      }
      return res.status(500).json({ message: error.message });
    }

    return res.status(201).json(
      mapVideo({
        ...createdVideo,
        users: createdVideo.users
      })
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getVideos = async (req, res) => {
  try {
    const { search = '', category = '' } = req.query;
    let query = supabaseAdminClient
      .from('videos')
      .select('*, users:uploaded_by(name)')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: videos, error } = await query;
    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json(videos.map(mapVideo));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getVideoById = async (req, res) => {
  try {
    const { data: video, error } = await supabaseAdminClient
      .from('videos')
      .select('*, users:uploaded_by(name)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    return res.status(200).json(mapVideo(video));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { data: video, error: readError } = await supabaseAdminClient
      .from('videos')
      .select('id, uploaded_by, cloudinary_video_public_id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (readError) {
      return res.status(500).json({ message: readError.message });
    }

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.uploaded_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const { error: deleteError } = await supabaseAdminClient
      .from('videos')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) {
      return res.status(500).json({ message: deleteError.message });
    }

    if (video.cloudinary_video_public_id) {
      await cloudinary.uploader.destroy(video.cloudinary_video_public_id, { resource_type: 'video' });
    }

    return res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const streamVideo = async (req, res) => {
  try {
    const { data: video, error: readError } = await supabaseAdminClient
      .from('videos')
      .select('id, video_url, thumbnail_url, views')
      .eq('id', req.params.id)
      .maybeSingle();

    if (readError) {
      return res.status(500).json({ message: readError.message });
    }

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    await supabaseAdminClient
      .from('videos')
      .update({ views: Number(video.views || 0) + 1, updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    return res.status(200).json({ streamUrl: video.video_url, thumbnailUrl: video.thumbnail_url });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRecommendedVideos = async (req, res) => {
  try {
    const { userId } = req.params;
    const { data: historyRows, error: historyError } = await supabaseAdminClient
      .from('watch_history')
      .select('video_id, videos:video_id(category)')
      .eq('user_id', userId)
      .order('watched_at', { ascending: false })
      .limit(30);

    if (historyError) {
      return res.status(500).json({ message: historyError.message });
    }

    const categories = (historyRows || [])
      .map((item) => item.videos?.category)
      .filter(Boolean);

    let videosQuery = supabaseAdminClient
      .from('videos')
      .select('*, users:uploaded_by(name)')
      .order('views', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(12);

    if (categories.length) {
      videosQuery = videosQuery.in('category', [...new Set(categories)]);
    }

    const { data: videos, error: videosError } = await videosQuery;
    if (videosError) {
      return res.status(500).json({ message: videosError.message });
    }

    return res.status(200).json((videos || []).map(mapVideo));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const postComment = async (req, res) => {
  try {
    const { videoId, comment } = req.body;

    if (!videoId || !comment) {
      return res.status(400).json({ message: 'videoId and comment are required' });
    }

    const { data: savedComment, error } = await supabaseAdminClient
      .from('comments')
      .insert({
        user_id: req.user.id,
        video_id: videoId,
        comment
      })
      .select('id, user_id, video_id, comment, created_at')
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(201).json({
      _id: savedComment.id,
      userId: {
        _id: req.user.id,
        name: req.user.name,
        profilePic: req.user.profilePic || ''
      },
      videoId: savedComment.video_id,
      comment: savedComment.comment,
      createdAt: savedComment.created_at
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCommentsByVideo = async (req, res) => {
  try {
    const { data: comments, error } = await supabaseAdminClient
      .from('comments')
      .select('id, user_id, video_id, comment, created_at, users:user_id(name, profile_pic_url)')
      .eq('video_id', req.params.videoId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json(
      (comments || []).map((item) => ({
        _id: item.id,
        userId: {
          _id: item.user_id,
          name: item.users?.name || 'User',
          profilePic: item.users?.profile_pic_url || ''
        },
        videoId: item.video_id,
        comment: item.comment,
        createdAt: item.created_at
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addWatchHistory = async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ message: 'videoId is required' });
    }

    const { data: history, error } = await supabaseAdminClient
      .from('watch_history')
      .insert({ user_id: req.user.id, video_id: videoId })
      .select('id, user_id, video_id, watched_at')
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(201).json({
      _id: history.id,
      userId: history.user_id,
      videoId: history.video_id,
      watchedAt: history.watched_at
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadVideo,
  getVideos,
  getVideoById,
  deleteVideo,
  streamVideo,
  getRecommendedVideos,
  postComment,
  getCommentsByVideo,
  addWatchHistory
};
