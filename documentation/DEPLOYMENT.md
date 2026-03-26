# Deployment Guide - Video Streaming Platform

## Prerequisites
- GitHub account
- Vercel account (free)
- Render account (free) OR Railway account (free)
- Supabase project (already set up)
- Cloudinary account (already set up)

---

## Step 1: Push Code to GitHub

### 1.1 Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - ready for deployment"
```

### 1.2 Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (e.g., `video-streaming-platform`)
3. Don't initialize with README (you already have one)

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/video-streaming-platform.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend (Render)

### 2.1 Sign Up for Render
1. Go to https://render.com
2. Sign up with GitHub

### 2.2 Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `video-streaming-api`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 2.3 Add Environment Variables
In Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend-url.vercel.app
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Note**: You'll update `CLIENT_URL` after deploying frontend.

### 2.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL (e.g., `https://video-streaming-api.onrender.com`)

---

## Step 3: Deploy Frontend (Vercel)

### 3.1 Sign Up for Vercel
1. Go to https://vercel.com
2. Sign up with GitHub

### 3.2 Import Project
1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 3.3 Add Environment Variable
Add this environment variable in Vercel:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

Replace with your actual Render backend URL from Step 2.4.

### 3.4 Deploy
1. Click "Deploy"
2. Wait for deployment (2-5 minutes)
3. Copy your frontend URL (e.g., `https://video-streaming-platform.vercel.app`)

---

## Step 4: Update Backend with Frontend URL

### 4.1 Update Render Environment Variable
1. Go back to Render dashboard
2. Navigate to your web service
3. Go to "Environment" tab
4. Update `CLIENT_URL` with your Vercel URL:
   ```
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```
5. Save changes (this will trigger a redeploy)

---

## Step 5: Verify Deployment

### 5.1 Test Backend Health
Visit: `https://your-backend-url.onrender.com/api/health`

Should return:
```json
{
  "status": "ok",
  "env": "production"
}
```

### 5.2 Test Frontend
1. Visit your Vercel URL
2. Try registering a new user
3. Try logging in
4. Try uploading a video
5. Try watching a video

---

## Alternative: Deploy Backend to Railway

If you prefer Railway over Render:

### Railway Deployment Steps

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Configure:
   - **Root Directory**: `server`
   - **Start Command**: `npm start`
6. Add all environment variables (same as Render)
7. Deploy and copy the URL

---

## Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- Check Render logs for errors
- Verify all environment variables are set correctly
- Ensure Supabase keys are valid

**Problem**: CORS errors
- Verify `CLIENT_URL` in backend matches your Vercel URL exactly
- Check browser console for specific CORS error

### Frontend Issues

**Problem**: Can't connect to backend
- Verify `REACT_APP_API_URL` is set correctly in Vercel
- Check if backend is running (visit health endpoint)
- Redeploy frontend after changing environment variables

**Problem**: Videos won't upload
- Check Cloudinary credentials in backend
- Verify file size limits (Render free tier has limits)
- Check backend logs for upload errors

### Database Issues

**Problem**: Authentication fails
- Verify Supabase schema is applied correctly
- Check Supabase RLS policies
- Ensure `users` table exists

---

## Post-Deployment Checklist

- [ ] Backend health endpoint responds
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Video upload works
- [ ] Video playback works
- [ ] Comments work
- [ ] Likes work
- [ ] Profile page loads
- [ ] Admin dashboard accessible (for admin users)

---

## Monitoring & Maintenance

### Free Tier Limitations

**Render Free Tier**:
- Spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free

**Vercel Free Tier**:
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS

### Upgrade Recommendations

Consider upgrading when:
- Backend spin-down affects user experience
- You exceed bandwidth limits
- You need faster build times
- You need custom domains

---

## Custom Domain Setup (Optional)

### For Frontend (Vercel)
1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### For Backend (Render)
1. Go to Render service settings
2. Navigate to "Custom Domains"
3. Add your custom domain
4. Update DNS records as instructed

---

## Environment Variables Reference

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend-url.vercel.app
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

---

## Continuous Deployment

Both Vercel and Render support automatic deployments:

- **Push to main branch** → Automatic deployment
- **Pull requests** → Preview deployments (Vercel)
- **Rollback** → One-click rollback to previous deployment

---

## Cost Estimate

**Free Tier (Recommended for MVP)**:
- Vercel: $0/month
- Render: $0/month
- Supabase: $0/month (up to 500MB database)
- Cloudinary: $0/month (up to 25GB storage, 25GB bandwidth)

**Total**: $0/month

**Paid Tier (For Production)**:
- Vercel Pro: $20/month
- Render Starter: $7/month
- Supabase Pro: $25/month
- Cloudinary Plus: $99/month

**Total**: ~$151/month

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation

---

## Next Steps After Deployment

1. Set up monitoring (Render provides basic monitoring)
2. Configure error tracking (Sentry, LogRocket)
3. Set up analytics (Google Analytics, Plausible)
4. Create backup strategy for Supabase
5. Document API for team members
6. Set up staging environment

---

**Deployment Complete! 🎉**

Your video streaming platform is now live and accessible worldwide.
