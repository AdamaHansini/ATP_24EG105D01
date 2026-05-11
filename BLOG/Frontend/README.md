Blog App — Frontend
This is the React frontend for the Blog App. Users can register, log in, read articles, and leave comments. Authors have a dashboard to manage their articles, and admins can moderate content.

Quick Start
Prerequisites
Node.js version 18 or higher
Backend server running at http://localhost:5000
Installation
Navigate to the frontend directory:

cd Frontend
Install dependencies:

npm install
Running the App
Start the development server:


npm run dev
Access the app at http://localhost:5173.

Build for Production
To create a production build, run:


npm run build
Tech Stack
React for building the UI
Vite for development
Zustand for state management
Axios for API requests
Tailwind CSS for styling
Folder Structure

Frontend/
public/              # Static assets
 src/
   components/      # UI components
   store/           # State management
   App.jsx          # Main app component
   index.css        # Global styles
     package.json
Key Features
User registration and login
Article browsing and commenting
Author dashboard for managing articles
Admin panel for moderating users and content