Blog App Backend

This is the backend part of the Blog Application developed using Express.js and MongoDB. It handles login, articles, comments, image uploads, and admin operations.

Features
User, author, and admin login/signup
JWT authentication with cookies
Profile image upload
Cloudinary image storage
Authors can create and edit articles
Users can read articles and comment
Admin can manage users and authors
Technologies Used
Node.js
Express.js
MongoDB
Mongoose
JWT
bcryptjs
Multer
Cloudinary
Setup
Install Packages
npm install
Create .env File
PORT=5000
DB_URL=your_mongodb_url
SECRET_KEY=your_secret_key
CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
Run Server
npm start

Server URL:

http://localhost:5000
API Routes
Auth
Register
Login
Logout
Update profile
User
View articles
View single article
Add comments
Author
Create article
Update article
Manage articles
Admin
View users
Block/unblock users
Dashboard data