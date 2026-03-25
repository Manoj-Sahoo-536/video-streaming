# Video Streaming Platform

A full-stack video streaming application with authentication, upload, playback, recommendations, comments, likes, and analytics.

## Tech Stack

### Frontend (`client`)
- React 18
- React Router DOM
- Axios
- Custom CSS

### Backend (`server`)
- Node.js
- Express.js
- Supabase (PostgreSQL + Auth)
- Cloudinary (video/image storage)
- Multer (in-memory multipart uploads)

---

## Architecture

### High-level flow
1. User authenticates via Supabase Auth through backend endpoints.
2. Frontend stores the access token and sends it in `Authorization: Bearer <token>`.
3. Backend validates token and resolves profile/role from `public.users`.
4. Video uploads are sent to backend (`multipart/form-data`), then uploaded to Cloudinary.
5. Metadata is persisted in Supabase tables (`videos`, `comments`, `watch_history`, `video_likes`, `video_views`).
6. Watch page loads metadata, stream URL, comments, and like status.
7. Views are tracked on first actual play (not on page open), and likes are deduplicated per user.

### Backend layers
- **Routes**: input mapping and middleware wiring
- **Controllers**: business logic, data validation, persistence
- **Middleware**: authentication + admin authorization
- **Config**: Supabase and Cloudinary clients

---

## Repository Structure

```text
video-streaming/
├── README.md
├── Video Streaming Platform Project Setup.md
├── client/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   ├── build/
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── styles.css
│       ├── api/
│       │   └── axios.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── VideoCard.jsx
│       │   └── VideoPlayer.jsx
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Profile.jsx
│           ├── Register.jsx
│           ├── Upload.jsx
│           └── Watch.jsx
└── server/
    ├── app.js
    ├── package.json
    ├── config/
    │   ├── cloudinary.js
    │   └── supabase.js
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   └── videoController.js
    ├── middleware/
    │   └── authMiddleware.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   └── videoRoutes.js
    ├── models/
    │   ├── Comment.js
    │   ├── History.js
    │   ├── User.js
    │   └── Video.js
    ├── supabase/
    │   └── schema.sql
    └── uploads/
```

> Note: `server/models` contains legacy model files and is not the active persistence layer (Supabase is).

---

## Features

- User registration and login
- Profile and role-based access (user/admin)
- Video upload with thumbnail handling
- Watch page with comments and recommendations
- Like/unlike with per-user deduplication
- View tracking on first playback event
- Watch history
- Admin analytics and user management endpoints
- Live search and category filtering on home page

---

## Environment Variables

Create `server/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:3000

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create `client/.env` (optional; defaults to localhost backend):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Getting Started

### 1) Install dependencies

From project root:

```bash
cd server
npm install

cd ../client
npm install
```

### 2) Apply database schema (Supabase)

- Open Supabase Dashboard → SQL Editor
- Execute `server/supabase/schema.sql`

### 3) Run backend

```bash
cd server
npm run dev
```

### 4) Run frontend

```bash
cd client
npm start
```

Frontend: `http://localhost:3000`  
Backend API: `http://localhost:5000/api`

---

## API Overview

Base URL: `/api`

### Health
- `GET /health`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/profile` (protected)

### Videos
- `GET /videos`
- `GET /videos/:id`
- `GET /videos/stream/:id`
- `POST /videos/upload` (protected, multipart)
- `PATCH /videos/:id` (protected)
- `DELETE /videos/:id` (protected)
- `GET /videos/my-videos` (protected)
- `GET /videos/recommended/:userId`

### Engagement
- `POST /videos/:id/view` (tracks first play)
- `POST /videos/:id/like` (protected)
- `GET /videos/:id/like-status` (protected)
- `POST /videos/comments` (protected)
- `GET /videos/comments/:videoId`
- `POST /videos/history` (protected)

### Users/Admin
- `GET /users/history/:userId` (protected)
- `GET /users` (admin)
- `GET /users/analytics` (admin)

---

## Data Model (Supabase)

Core tables:
- `users`
- `videos`
- `comments`
- `watch_history`
- `video_likes` (unique user-video likes)
- `video_views` (deduplicated view tracking by user/session)

Row Level Security policies are defined in `server/supabase/schema.sql`.

---

## Scripts

### Server
- `npm run dev` — start server with nodemon
- `npm start` — start server

### Client
- `npm start` — start React dev server
- `npm run build` — production build
- `npm test` — run tests

---

## Troubleshooting

### Backend won't start
- Verify `server/.env` values are present and valid.
- Ensure Supabase keys are real values, not placeholders.

### Videos list loads but watch page fails
- Check backend is running on expected port.
- Verify `REACT_APP_API_URL` points to the running API.
- Re-login if token is expired.

### Like/View behavior unexpected
- Confirm latest schema (`video_likes`, `video_views`) is applied.
- Verify RLS policies from `schema.sql` are present in Supabase.

---

## Future Improvements

- Pagination/infinite scrolling on home feed
- CDN-backed adaptive bitrate streaming (HLS/DASH)
- Background jobs for thumbnail/transcoding pipelines
- Automated tests for critical API flows
- CI/CD with migration checks

---

## License

Add a project license file if you plan to distribute this repository.

## Copyright

Copyright (c) 2026 StreamVault.

This repository includes a subtle in-app watermark in the UI shell. Update watermark text in `client/src/App.js` if you want your personal/company name.
