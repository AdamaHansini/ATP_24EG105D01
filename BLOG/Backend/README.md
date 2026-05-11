Blog App — Backend
This is the backend engine for our Blog App. It handles all the heavy lifting: user accounts, security, article management, and comments.

The server is built with Node.js and Express, uses MongoDB for data, and manages images through Cloudinary.

 Quick Start
1. Installation
First, navigate to the backend folder and install the dependencies:


cd Backend
npm install
2. Environment Setup
Create a .env file in the root of the Backend/ directory and add your credentials:


DB_URL=mongodb://localhost:27017/blogappdb
PORT=5000
SECRET_KEY=07811ec7fe03051e8cd6c0e86964496fad80f2498ac8a2a2867c0b80d6fedafb

CLOUDINARY_CLOUD_NAME=dtnwysmof
CLOUDINARY_API_KEY=522532754516279
CLOUDINARY_API_SECRET=5x_TK4LBi4vzHdW_WFAcJGzx3Lo


3. Run the Server
To start the server with auto-reload (using nodemon):


nodemon server
The API will be live at http://localhost:5000.

Tech Stack
Runtime: Node.js & Express
Database: MongoDB with Mongoose
Security: JWT (stored in secure HTTP-only cookies) & bcryptjs for password hashing
Media: Cloudinary (Profile images) & Multer (File handling)

User Roles
The app uses a role-based system to keep things organized:

User: Can read articles and leave comments.
Author: Can write, edit, and "soft-delete" their own articles.
Admin: Has the power to block/unblock users and moderate all content.


Project Structure
/APIs: Contains the routes for Auth, Users, Authors, and Admins.
/models: Database schemas for Users and Articles.
/middlewares: Security checks to ensure only logged-in users can access certain routes.
/config: Setup for Cloudinary and image uploads.


Key Features
Secure Auth: We use HTTP-only cookies for JWTs, which is much safer against XSS attacks than local storage.
Soft Deletion: Authors don't "permanently" delete articles; they just deactivate them so they can be restored later.
Image Handling: Profile pictures are processed in memory and sent straight to the cloud—no messy temporary files left on the server.
Error Handling: A global system catches common issues like duplicate emails or invalid IDs and sends back clear messages.
Note: For local development, the CORS settings are currently locked to http://localhost:5173 (Vite's default). If you deploy this, remember to update the origin in server.js.