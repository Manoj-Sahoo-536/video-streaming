# **Video Streaming Platform Project Setup Technologies Used**

**Frontend**

* React.js

* React Router DOM

* Axios

* HTML, CSS, Bootstrap / MUI

* Video.js / HLS.js (video player)

* JWT (Authentication)

# **Backend**

* Node.js

* Express.js

* MongoDB

* Mongoose

* JWT Authentication

* Multer / AWS S3 (Video upload)

* FFmpeg (Video processing C thumbnail generation)

# **Streaming s Storage**

* AWS S3 / Cloudinary (Video Storage)

* AWS CloudFront / CDN (Streaming)

* HLS (HTTP Live Streaming)

# **Core Features User Features**

* User Registration C Login

* Browse Videos

* Search C Filter Videos

* Video Streaming Player

* Like, Comment, Share

* Watch History

* Recommended Videos

# **Admin Features**

* Upload Video

* Manage Videos

* Delete Videos

* View Analytics

* Manage Users

# **Project Folder Structure**

video-streaming/

│

├── client/	\# React Frontend

│ ├── public/

│ ├── src/

│ │ ├── api/

│ │ │ └── axios.js

│ │ ├── components/

│ │ │ ├── Navbar.jsx

│ │ │ ├── VideoCard.jsx

│ │ │ ├── VideoPlayer.jsx

│ │ │ └── Sidebar.jsx

│ │ ├── pages/

│ │ │ ├── Home.jsx

│ │ │ ├── Login.jsx

│ │ │ ├── Register.jsx

│ │ │ ├── Watch.jsx

│ │ │ ├── Upload.jsx

│ │ │ └── Dashboard.jsx

│ │ ├── App.js

│ │ └── index.js

│  └── package.json

│

├── server/	\# Node Backend

│ ├── controllers/

│ │ ├── authController.js

│ │ ├── videoController.js

│ │ └── userController.js

│ │

│ ├── models/

│ │ ├── User.js

│ │ ├── Video.js

│ │ ├── Comment.js

│ │ └── History.js

│ │

│ ├── routes/

│ │ ├── authRoutes.js

│ │ ├── videoRoutes.js

│ │ └── userRoutes.js

│ │

│ ├── middleware/

│  │  └── authMiddleware.js

│ │

│ ├── uploads/

│ ├── app.js

│  └── package.json

# **Database Schema (MongoDB)**

**User Schema**

name email  
password profilePic role createdAt

# **Video Schema**

title

description videoUrl thumbnailUrl duration

views likes

category

uploadedBy createdAt

# **Comment Schema**

userId videoId

comment createdAt

# **Watch History Schema**

userId videoId

watchedAt

# **Authentication Flow**

1. User registers

2. Password hashed using bcrypt

3. JWT token generated

4. Token stored in frontend

5. Token used for protected routes

# **API Endpoints Auth**

POST /api/auth/register POST /api/auth/login GET /api/auth/profile

# **Video**

POST /api/videos/upload GET /api/videos  
GET /api/videos/:id DELETE /api/videos/:id

# **Streaming**

GET /api/videos/stream/:id

# **Recommendation**

GET /api/videos/recommended/:userId

# **Comments**

POST /api/comments

GET /api/comments/:videoId

# **Video Upload s Streaming Flow**

User Upload Video

↓

Backend receives video

↓

Store in AWS S3 / Cloudinary

↓

Generate Thumbnail using FFmpeg

↓

Save video metadata in MongoDB

↓

User streams via CDN (CloudFront)

# **Recommendation System (Basic Logic) Option 1: Simple Recommendation**

* Based on category

* Based on watch history

# **Option 2: Advanced Recommendation**

* Based on:

  * watch time

  * likes

  * user interest

  * trending videos

