# Mini Social Media Platform

**CodeAlpha Full Stack Development Internship – Task 2**

A fully functional mini social media web application built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- User registration and login with JWT authentication
- Create and manage user profiles
- Create posts with optional images
- View personalized feed (own posts + followed users' posts)
- Like and unlike posts
- Comment on posts
- Follow and unfollow users
- View followers and following lists
- Explore and search users
- Responsive design for desktop and mobile
- Delete own posts and comments
- Edit profile (name, bio, profile picture)

## Technologies Used

**Frontend:**
- HTML5
- CSS3 (Custom, no frameworks)
- Vanilla JavaScript (ES6+)

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Project Structure

```
mini-social-media/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── profile.html
│   ├── create-post.html
│   ├── explore.html
│   ├── followers.html
│   ├── following.html
│   ├── user-profile.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js
│       ├── auth.js
│       ├── feed.js
│       ├── profile.js
│       ├── posts.js
│       ├── comments.js
│       ├── follow.js
│       └── explore.js
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   └── Follow.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── postRoutes.js
│   │   ├── commentRoutes.js
│   │   └── followRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── postController.js
│   │   ├── commentController.js
│   │   └── followController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── .env
│   ├── .env.example
│   └── seed.js
├── README.md
└── .gitignore
```

## MongoDB Setup

1. Install MongoDB on your system
2. Start MongoDB service
3. The application will connect to `mongodb://localhost:27017/mini-social-media` by default

## Environment Variables

Create a `.env` file in the `backend` folder with:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mini-social-media
JWT_SECRET=your_jwt_secret_key_here
```

## Installation

### Backend Setup

```bash
cd mini-social-media/backend
npm install
```

### Frontend Setup

No build step required! The frontend uses vanilla HTML, CSS, and JavaScript. Just open the HTML files in a browser or serve them through the Express backend.

## Running the Project

### Start Backend Server

```bash
cd mini-social-media/backend
npm run dev
```

The server will start on `http://localhost:5000`

### Access the Application

Open your browser and go to:
```
http://localhost:5000
```

## Database Seeding

To populate the database with sample data:

```bash
cd mini-social-media/backend
npm run seed
```

This will create:
- 5 sample users
- 10 sample posts
- 10 sample comments
- 10 follow relationships

## Sample Login Credentials

After running the seed script, you can login with:

| Email | Username | Password |
|-------|----------|----------|
| john@example.com | johndoe | password123 |
| jane@example.com | janesmith | password123 |
| mike@example.com | mikej | password123 |
| sarah@example.com | sarahw | password123 |
| alex@example.com | alexb | password123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/posts` - Get user's posts
- `GET /api/users/:id/followers` - Get user's followers
- `GET /api/users/:id/following` - Get user's following

### Posts
- `GET /api/posts/feed` - Get personalized feed
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create a post
- `DELETE /api/posts/:id` - Delete a post

### Likes
- `POST /api/posts/:id/like` - Like a post
- `DELETE /api/posts/:id/like` - Unlike a post

### Comments
- `GET /api/posts/:id/comments` - Get comments for a post
- `POST /api/posts/:id/comments` - Add a comment
- `DELETE /api/comments/:id` - Delete a comment

### Follow
- `POST /api/users/:id/follow` - Follow a user
- `DELETE /api/users/:id/follow` - Unfollow a user
- `GET /api/users/:id/follow-status` - Check follow status

## Sample User Workflow

1. **Register/Login**: Create an account or login with sample credentials
2. **View Feed**: See posts from yourself and users you follow
3. **Explore Users**: Search and discover other users
4. **Follow Users**: Follow interesting users to see their posts in your feed
5. **Create Post**: Share your thoughts with optional images
6. **Like/Unlike**: Interact with posts you enjoy
7. **Comment**: Add comments to posts
8. **View Profile**: Check your profile stats and edit your information
9. **Manage Followers**: View who follows you and who you follow

## Testing Instructions

1. Start MongoDB
2. Run `npm install` in backend folder
3. Run `npm run seed` to populate sample data
4. Run `npm run dev` to start the server
5. Open `http://localhost:5000` in your browser
6. Login with sample credentials
7. Test all features: create posts, like, comment, follow, etc.

## Future Enhancements

- Direct messaging between users
- Post sharing/reposting
- Hashtags and trending topics
- Notifications
- Image upload (instead of URL)
- Post editing
- User blocking
- Dark mode
- Mobile app version

## Important Files for Project Presentation

- `backend/server.js` - Main server entry point
- `backend/models/` - Database schemas
- `backend/controllers/` - Business logic
- `backend/routes/` - API endpoints
- `frontend/js/api.js` - Frontend API utility
- `frontend/css/style.css` - Complete styling
- `frontend/index.html` - Main feed page

## Common Errors and Solutions

| Error | Solution |
|-------|----------|
| MongoDB connection failed | Ensure MongoDB is running on port 27017 |
| JWT token expired | Login again to get a new token |
| CORS errors | Backend has CORS enabled; ensure frontend calls `localhost:5000` |
| Posts not loading | Check MongoDB connection and seed data |
| Images not showing | Ensure image URLs are valid and accessible |

## License

This project is created for educational purposes as part of the CodeAlpha Full Stack Development Internship.
