// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // loading = true while we are still determining whether there is a valid session
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadUser() {
      const token = localStorage.getItem('shopsphere_token');
      if (token) {
        try {
          const profile = await authService.getMe();
          if (active) {
            setUser(profile || null);
            setLoading(false);
          }
        } catch (e) {
          if (e.statusCode !== 401 && e.statusCode !== 403) console.warn('Could not restore the signed-in session:', e.message);
          if (active) setUser(null);
          if (active) setLoading(false);
        }
      } else {
        if (active) setUser(null);
      }
      if (active) setLoading(false);
    }
    loadUser();
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('shopsphere:unauthorized', handleUnauthorized);
    return () => {
      active = false;
      window.removeEventListener('shopsphere:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password, role) => {
    const res = await authService.login(email, password, role);
    setUser(res.user);
    setLoading(false);
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    setUser(res.user);
    setLoading(false);
    return res;
  };

  const logout = async () => {
    localStorage.removeItem('shopsphere_token');
    setUser(null);
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Could not confirm logout with the backend:', error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
