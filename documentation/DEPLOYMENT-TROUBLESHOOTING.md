# Deployment Troubleshooting Guide

## 🔍 Quick Diagnosis

### Is your issue here?

1. **CORS Error** → [Jump to CORS Section](#cors-errors)
2. **Backend Not Responding** → [Jump to Backend Section](#backend-issues)
3. **Frontend Won't Load** → [Jump to Frontend Section](#frontend-issues)
4. **Upload Fails** → [Jump to Upload Section](#upload-issues)
5. **Login/Auth Fails** → [Jump to Auth Section](#authentication-issues)
6. **Database Errors** → [Jump to Database Section](#database-issues)

---

## 🚨 CORS Errors

### Symptom
Browser console shows:
```
Access to XMLHttpRequest at 'https://your-api.onrender.com' from origin 'https://your-app.vercel.app' has been blocked by CORS policy
```

### Causes & Solutions

#### Cause 1: CLIENT_URL Mismatch
**Check**: Does `CLIENT_URL` in Render exactly match your Vercel URL?

**Fix**:
1. Go to Render dashboard
2. Navigate to your web service
3. Go to "Environment" tab
4. Update `CLIENT_URL` to: `https://your-exact-vercel-url.vercel.app`
5. Save (triggers redeploy)
6. Wait 2-3 minutes
7. Test again

#### Cause 2: Missing Protocol
**Check**: Does CLIENT_URL include `https://`?

**Fix**: CLIENT_URL must be `https://your-app.vercel.app` NOT `your-app.vercel.app`

#### Cause 3: Trailing Slash
**Check**: Does CLIENT_URL have a trailing slash?

**Fix**: Remove trailing slash. Use `https://your-app.vercel.app` NOT `https://your-app.vercel.app/`

---

## 🖥️ Backend Issues

### Issue: Backend Returns 404

**Symptom**: All API calls return 404

**Diagnosis**:
```bash
# Test health endpoint
curl https://your-backend.onrender.com/api/health
```

**Solutions**:

1. **Check Render Logs**
   - Go to Render dashboard
   - Click on your service
   - Click "Logs" tab
   - Look for errors

2. **Verify Start Command**
   - Should be: `npm start`
   - NOT: `node app.js` (unless in root)

3. **Check Root Directory**
   - Should be: `server`
   - Verify in Render settings

### Issue: Backend Spinning Down

**Symptom**: First request takes 30-60 seconds

**Cause**: Render free tier spins down after 15 minutes of inactivity

**Solutions**:
1. **Accept it** (it's free tier behavior)
2. **Upgrade to paid tier** ($7/month for always-on)
3. **Use a ping service** (keep it awake)
   - UptimeRobot (free)
   - Ping every 14 minutes

### Issue: Backend Crashes

**Symptom**: Render logs show crashes or restarts

**Diagnosis Steps**:
1. Check Render logs for error messages
2. Look for missing environment variables
3. Check for memory issues (free tier = 512MB)

**Common Fixes**:
- Add missing environment variables
- Fix code errors shown in logs
- Reduce memory usage
- Upgrade to larger instance

---

## 🌐 Frontend Issues

### Issue: Frontend Shows Blank Page

**Diagnosis**:
1. Open browser console (F12)
2. Look for errors

**Common Causes**:

#### Cause 1: Build Failed
**Check**: Vercel deployment logs

**Fix**:
1. Go to Vercel dashboard
2. Click on your project
3. Go to "Deployments"
4. Click latest deployment
5. Check build logs for errors
6. Fix errors in code
7. Push to GitHub (auto-redeploys)

#### Cause 2: Wrong Root Directory
**Check**: Vercel settings

**Fix**:
1. Go to Vercel project settings
2. Go to "General"
3. Set Root Directory to: `client`
4. Redeploy

### Issue: API Calls Fail

**Symptom**: Console shows network errors

**Diagnosis**:
```javascript
// Check in browser console
console.log(process.env.REACT_APP_API_URL)
```

**Fix**:
1. Go to Vercel dashboard
2. Project → Settings → Environment Variables
3. Verify `REACT_APP_API_URL` is set correctly
4. Should be: `https://your-backend.onrender.com/api`
5. Redeploy if changed

---

## 📤 Upload Issues

### Issue: Video Upload Fails

**Symptom**: Upload button doesn't work or shows error

**Diagnosis Steps**:

1. **Check Browser Console**
   - Look for error messages
   - Note the error code

2. **Check Backend Logs**
   - Go to Render logs
   - Look for upload-related errors

**Common Causes**:

#### Cause 1: Cloudinary Credentials Wrong
**Fix**:
1. Go to Render environment variables
2. Verify:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Get correct values from Cloudinary console
4. Update and redeploy

#### Cause 2: File Too Large
**Render Free Tier Limits**:
- Request size: 100MB max
- Memory: 512MB

**Fix**:
- Test with smaller video (< 50MB)
- Upgrade Render plan for larger files
- Implement client-side compression

#### Cause 3: Timeout
**Symptom**: Upload starts but times out

**Fix**:
- Render free tier may timeout on large uploads
- Upgrade to paid tier
- Reduce video size

---

## 🔐 Authentication Issues

### Issue: Can't Register/Login

**Symptom**: Registration or login fails

**Diagnosis**:

1. **Check Backend Logs**
   - Look for Supabase errors

2. **Test Supabase Connection**
   ```bash
   # In backend logs, look for:
   "Supabase client initialized"
   ```

**Common Causes**:

#### Cause 1: Supabase Credentials Wrong
**Fix**:
1. Go to Supabase dashboard
2. Project Settings → API
3. Copy correct values:
   - Project URL → `SUPABASE_URL`
   - anon/public key → `SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
4. Update in Render
5. Redeploy

#### Cause 2: Schema Not Applied
**Fix**:
1. Go to Supabase dashboard
2. SQL Editor
3. Run `server/supabase/schema.sql`
4. Verify tables exist:
   - users
   - videos
   - comments
   - watch_history
   - video_likes
   - video_views

### Issue: Token Expired

**Symptom**: Logged in users get logged out

**Cause**: JWT token expired (normal behavior)

**Fix**: Users need to log in again (this is expected)

---

## 🗄️ Database Issues

### Issue: Database Connection Fails

**Symptom**: All database operations fail

**Diagnosis**:
1. Check Supabase dashboard
2. Verify project is active
3. Check API usage limits

**Fix**:
1. Verify Supabase credentials in Render
2. Check Supabase project status
3. Verify not over free tier limits:
   - 500MB database
   - 50,000 monthly active users

### Issue: RLS Policy Errors

**Symptom**: "permission denied" errors

**Fix**:
1. Go to Supabase dashboard
2. Authentication → Policies
3. Verify RLS policies from schema.sql are applied
4. Re-run schema.sql if needed

---

## 🔧 General Debugging Steps

### Step 1: Check All URLs
```
Frontend URL: https://__________.vercel.app
Backend URL: https://__________.onrender.com
Backend Health: https://__________.onrender.com/api/health
```

### Step 2: Verify Environment Variables

**Backend (Render)**:
- [ ] NODE_ENV=production
- [ ] PORT=5000
- [ ] CLIENT_URL=(your Vercel URL)
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET

**Frontend (Vercel)**:
- [ ] REACT_APP_API_URL=(your Render URL + /api)

### Step 3: Check Logs

**Render Logs**:
1. Render dashboard → Your service → Logs
2. Look for errors in red
3. Note timestamps

**Vercel Logs**:
1. Vercel dashboard → Your project → Deployments
2. Click latest deployment
3. Check build and runtime logs

**Browser Console**:
1. Open DevTools (F12)
2. Console tab
3. Network tab (check failed requests)

### Step 4: Test Endpoints Directly

```bash
# Test backend health
curl https://your-backend.onrender.com/api/health

# Test backend CORS
curl -H "Origin: https://your-frontend.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-backend.onrender.com/api/videos
```

---

## 📞 Still Stuck?

### Checklist Before Asking for Help

- [ ] Checked all logs (Render, Vercel, Browser)
- [ ] Verified all environment variables
- [ ] Tested health endpoint
- [ ] Cleared browser cache
- [ ] Tried in incognito/private mode
- [ ] Waited for deployments to complete
- [ ] Checked Supabase dashboard
- [ ] Verified Cloudinary credentials

### Information to Provide

When asking for help, include:
1. **What you're trying to do**
2. **What's happening instead**
3. **Error messages** (exact text)
4. **Screenshots** of errors
5. **Logs** from Render/Vercel
6. **Environment** (browser, OS)
7. **Steps to reproduce**

---

## 🎯 Quick Fixes Checklist

Try these in order:

1. [ ] Clear browser cache and cookies
2. [ ] Try incognito/private mode
3. [ ] Verify CLIENT_URL matches Vercel URL exactly
4. [ ] Verify REACT_APP_API_URL matches Render URL + /api
5. [ ] Check all environment variables are set
6. [ ] Redeploy backend (Render)
7. [ ] Redeploy frontend (Vercel)
8. [ ] Wait 5 minutes for DNS propagation
9. [ ] Test health endpoint directly
10. [ ] Check Render and Vercel logs

---

## 🔄 How to Rollback

### Vercel Rollback
1. Go to Vercel dashboard
2. Your project → Deployments
3. Find previous working deployment
4. Click "..." → "Promote to Production"

### Render Rollback
1. Go to Render dashboard
2. Your service → Events
3. Find previous deployment
4. Click "Redeploy"

---

## ✅ Verification Tests

After fixing issues, run these tests:

```bash
# 1. Backend health
curl https://your-backend.onrender.com/api/health

# 2. Frontend loads
# Visit: https://your-frontend.vercel.app

# 3. CORS works
# Open browser console, check for CORS errors

# 4. Auth works
# Try registering a new user

# 5. Upload works
# Try uploading a small video

# 6. Playback works
# Try watching a video
```

---

**Remember**: Most issues are environment variable mismatches or CORS configuration. Double-check those first!
