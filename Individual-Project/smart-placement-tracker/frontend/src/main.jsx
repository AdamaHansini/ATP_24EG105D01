import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import App from './App.jsx';
import './index.css';

// In production the Vite proxy is not available, so point axios directly at the API.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#172033',
          color: '#f8fafc',
          border: '1px solid #334155',
          borderRadius: '8px',
          fontSize: '13px',
        },
        success: { iconTheme: { primary: '#2563eb', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  </React.StrictMode>
);
