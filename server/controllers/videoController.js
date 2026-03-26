const cloudinary = require('../config/cloudinary');
const { supabaseAdminClient } = require('../config/supabase');

const uploadToCloudinary = (buffer, resourceType = 'video') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'video-streaming/videos',
        resource_type: resourceType
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

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};

const getOptionalUserId = async (req) => {
  const token = getBearerToken(req);
  if (!token) return null;

  const { data, error } = await supabaseAdminClient.auth.getUser(token);
  if (error || !data?.user?.id) return null;

  return data.user.id;
};

const uploadVideo = async (req, res) => {
  try {
    const { title, description, category, videoUrl, thumbnailUrl, duration } = req.body;
    
    // Express 'multer' with .fields() puts it in req.files
    const hasVideoFile = Boolean(req.files?.['video']?.[0]?.buffer);
    const hasThumbnailFile = Boolean(req.files?.['thumbnail']?.[0]?.buffer);

    // Fallback if someone used .single() somehow (backwards compat during transition)
    const hasSingleFile = Boolean(req.file?.buffer); 

    if (!title || (!videoUrl && !hasVideoFile && !hasSingleFile)) {
      return res.status(400).json({ message: 'Title and video file/url are required' });
    }

    let finalVideoUrl = videoUrl;
    let finalThumbnailUrl = thumbnailUrl || '';
    let finalDuration = Number(duration || 0);
    let cloudinaryVideoPublicId = null;

    // Handle video buffer
    const videoBuffer = hasVideoFile ? req.files['video'][0].buffer : (hasSingleFile ? req.file.buffer : null);

    if (videoBuffer) {
      const uploadedVideo = await uploadToCloudinary(videoBuffer, 'video');
      finalVideoUrl = uploadedVideo.secure_url;
      finalDuration = Number(uploadedVideo.duration || finalDuration || 0);
      cloudinaryVideoPublicId = uploadedVideo.public_id;

      // Only auto-generate if user didn't provide a custom url and didn't provide a custom file
      if (!finalThumbnailUrl && !hasThumbnailFile) {
        finalThumbnailUrl = cloudinary.url(uploadedVideo.public_id, {
          resource_type: 'video',
          format: 'jpg',
          transformation: [{ width: 640, height: 360, crop: 'fill' }]
        });
      }
    }

    // Handle thumbnail buffer
    if (hasThumbnailFile) {
      const uploadedThumb = await uploadToCloudinary(req.files['thumbnail'][0].buffer, 'image');
      finalThumbnailUrl = uploadedThumb.secure_url;
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

const updateVideo = async (req, res) => {
  try {
    const { title, description, category, thumbnailUrl } = req.body;

    // Fetch video to check ownership
    const { data: video, error: readError } = await supabaseAdminClient
      .from('videos')
      .select('id, uploaded_by')
      .eq('id', req.params.id)
      .maybeSingle();

    if (readError) return res.status(500).json({ message: readError.message });
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (video.uploaded_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    // Build only the fields that were sent
    const patch = { updated_at: new Date().toISOString() };
    if (title !== undefined) patch.title = title;
    if (description !== undefined) patch.description = description;
    if (category !== undefined) patch.category = category;
    
    // Check if new thumbnail logic
    if (req.file) {
      const uploadedThumb = await uploadToCloudinary(req.file.buffer, 'image');
      patch.thumbnail_url = uploadedThumb.secure_url;
    } else if (thumbnailUrl !== undefined) {
      patch.thumbnail_url = thumbnailUrl;
    }

    const { data: updated, error: updateError } = await supabaseAdminClient
      .from('videos')
      .update(patch)
      .eq('id', req.params.id)
      .select('*, users:uploaded_by(name)')
      .single();

    if (updateError) return res.status(500).json({ message: updateError.message });

    return res.status(200).json(mapVideo(updated));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserVideos = async (req, res) => {
  try {
    const { data: videos, error } = await supabaseAdminClient
      .from('videos')
      .select('*, users:uploaded_by(name)')
      .eq('uploaded_by', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json((videos || []).map(mapVideo));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getLikedVideos = async (req, res) => {
  try {
    const { data: rows, error } = await supabaseAdminClient
      .from('video_likes')
      .select('created_at, videos:video_id(*, users:uploaded_by(name))')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const likedVideos = (rows || [])
      .map((item) => item.videos)
      .filter(Boolean)
      .map(mapVideo);

    return res.status(200).json(likedVideos);
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

    return res.status(200).json({ streamUrl: video.video_url, thumbnailUrl: video.thumbnail_url });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const trackVideoView = async (req, res) => {
  try {
    const { id } = req.params;
    const rawSessionId = typeof req.body?.sessionId === 'string' ? req.body.sessionId : '';
    const sessionId = rawSessionId.trim().slice(0, 128);
    const userId = await getOptionalUserId(req);

    const { data: video, error: videoError } = await supabaseAdminClient
      .from('videos')
      .select('id, views')
      .eq('id', id)
      .maybeSingle();

    if (videoError) {
      return res.status(500).json({ message: videoError.message });
    }

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'sessionId is required for guest views' });
    }

    let alreadyCounted = false;
    let currentViews = Number(video.views || 0);

    if (userId) {
      const { data: existing, error: existingError } = await supabaseAdminClient
        .from('video_views')
        .select('id')
        .eq('video_id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingError) {
        return res.status(500).json({ message: existingError.message });
      }

      if (existing) {
        alreadyCounted = true;
      } else {
        const { error: insertError } = await supabaseAdminClient
          .from('video_views')
          .insert({ video_id: id, user_id: userId });

        if (insertError) {
          return res.status(500).json({ message: insertError.message });
        }

        const { data: watched, error: watchedError } = await supabaseAdminClient
          .from('watch_history')
          .select('id')
          .eq('user_id', userId)
          .eq('video_id', id)
          .maybeSingle();

        if (watchedError) {
          return res.status(500).json({ message: watchedError.message });
        }

        if (!watched) {
          const { error: historyInsertError } = await supabaseAdminClient
            .from('watch_history')
            .insert({ user_id: userId, video_id: id });

          if (historyInsertError) {
            return res.status(500).json({ message: historyInsertError.message });
          }
        }

        currentViews += 1;
      }
    } else {
      const { data: existing, error: existingError } = await supabaseAdminClient
        .from('video_views')
        .select('id')
        .eq('video_id', id)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (existingError) {
        return res.status(500).json({ message: existingError.message });
      }

      if (existing) {
        alreadyCounted = true;
      } else {
        const { error: insertError } = await supabaseAdminClient
          .from('video_views')
          .insert({ video_id: id, session_id: sessionId });

        if (insertError) {
          return res.status(500).json({ message: insertError.message });
        }

        currentViews += 1;
      }
    }

    if (!alreadyCounted) {
      const { error: updateError } = await supabaseAdminClient
        .from('videos')
        .update({ views: currentViews, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) {
        return res.status(500).json({ message: updateError.message });
      }
    }

    return res.status(200).json({
      message: alreadyCounted ? 'View already counted' : 'View counted',
      counted: !alreadyCounted,
      views: currentViews
    });
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
    const { videoId } = req.body;
    const comment = String(req.body.comment || '').trim().slice(0, 1000);

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

const likeVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'like' or 'unlike'

    if (!['like', 'unlike'].includes(action)) {
      return res.status(400).json({ message: 'action must be like or unlike' });
    }

    const { data: video, error: readError } = await supabaseAdminClient
      .from('videos')
      .select('id, likes')
      .eq('id', id)
      .maybeSingle();

    if (readError) return res.status(500).json({ message: readError.message });
    if (!video) return res.status(404).json({ message: 'Video not found' });

    let liked = false;
    let likes = Number(video.likes || 0);

    if (action === 'like') {
      const { error: insertError } = await supabaseAdminClient
        .from('video_likes')
        .insert({ video_id: id, user_id: req.user.id });

      if (insertError) {
        const isDuplicate = insertError.code === '23505' || String(insertError.message || '').toLowerCase().includes('duplicate key');
        if (!isDuplicate) {
          return res.status(500).json({ message: insertError.message });
        }
      } else {
        likes += 1;
      }

      liked = true;
    } else {
      const { data: deletedRows, error: deleteError } = await supabaseAdminClient
        .from('video_likes')
        .delete()
        .eq('video_id', id)
        .eq('user_id', req.user.id)
        .select('id');

      if (deleteError) {
        return res.status(500).json({ message: deleteError.message });
      }

      if (Array.isArray(deletedRows) && deletedRows.length > 0) {
        likes = Math.max(0, likes - 1);
      }

      liked = false;
    }

    const { error: updateError } = await supabaseAdminClient
      .from('videos')
      .update({ likes, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      return res.status(500).json({ message: updateError.message });
    }

    return res.status(200).json({ message: 'Success', likes, liked });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getVideoLikeStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: video, error: videoError } = await supabaseAdminClient
      .from('videos')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (videoError) return res.status(500).json({ message: videoError.message });
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const { data: existingLike, error: likeError } = await supabaseAdminClient
      .from('video_likes')
      .select('id')
      .eq('video_id', id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (likeError) {
      return res.status(500).json({ message: likeError.message });
    }

    return res.status(200).json({ liked: Boolean(existingLike), likes: Number(video.likes || 0) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadVideo,
  getVideos,
  getVideoById,
  updateVideo,
  getUserVideos,
  getLikedVideos,
  deleteVideo,
  streamVideo,
  trackVideoView,
  getRecommendedVideos,
  postComment,
  getCommentsByVideo,
  addWatchHistory,
  likeVideo,
  getVideoLikeStatus
};
