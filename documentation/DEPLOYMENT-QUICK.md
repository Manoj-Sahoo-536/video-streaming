# Quick Deployment Reference Card

## 🚀 5-Minute Deployment Summary

### Step 1: Push to GitHub (2 min)
```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

### Step 2: Deploy Backend - Render (2 min)
1. Go to https://render.com → Sign up with GitHub
2. New + → Web Service → Connect your repo
3. Settings:
   - Root Directory: `server`
   - Build: `npm install`
   - Start: `npm start`
4. Add environment variables (copy from server/.env)
5. Deploy → Copy backend URL

### Step 3: Deploy Frontend - Vercel (1 min)
1. Go to https://vercel.com → Sign up with GitHub
2. Import Project → Select your repo
3. Settings:
   - Root Directory: `client`
   - Framework: Create React App
4. Add env var: `REACT_APP_API_URL=https://your-backend.onrender.com/api`
5. Deploy → Copy frontend URL

### Step 4: Update Backend (30 sec)
1. Go back to Render
2. Update `CLIENT_URL` env var with your Vercel URL
3. Save (auto-redeploys)

### ✅ Done!

---

## 📋 Environment Variables Needed

### Backend (Render)
```
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-app.vercel.app
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-api.onrender.com/api
```

---

## 🔗 Important URLs

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Cloudinary Console**: https://cloudinary.com/console

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error | Update `CLIENT_URL` in backend to match Vercel URL |
| Backend not responding | Check Render logs, verify env vars |
| Frontend can't connect | Update `REACT_APP_API_URL` in Vercel |
| Upload fails | Check Cloudinary credentials |
| Auth fails | Verify Supabase schema is applied |

---

## 💰 Cost: $0/month (Free Tier)

- Render: Free (spins down after 15 min idle)
- Vercel: Free (100GB bandwidth/month)
- Supabase: Free (500MB database)
- Cloudinary: Free (25GB storage)

---

## 📞 Need Help?

See full guide: `DEPLOYMENT.md`
