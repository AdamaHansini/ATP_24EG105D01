# Blog App Frontend

React and Vite frontend for the blog application.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the `Frontend` folder:

```env
VITE_API_URL=your_backend_url
```

Example for local backend:

```env
VITE_API_URL=http://localhost:5000
```

3. Start the frontend:

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## Features

- User registration and login
- User, author, and admin pages
- Protected routes
- Article reading and management
- Author dashboard
- Admin dashboard
- Logout functionality

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

