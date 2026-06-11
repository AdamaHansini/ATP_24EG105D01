import axios from 'axios';

// Uses VITE_API_URL from .env in dev and Vercel env vars in production.
// Falls back to relative '/api' so the Vercel vercel.json rewrite still works.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  withCredentials: true,
});

export default api;
