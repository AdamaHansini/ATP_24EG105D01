// frontend/src/services/authService.js
import { api } from './api.js';

export const authService = {
  /**
   * Log in with email, password, and optional role.
   * The backend will verify the role against the MongoDB user record if provided.
   * Returns { user, token }.
   */
  login: async (email, password, role) => {
    const payload = { email, password };
    if (role) payload.role = role;

    const res = await api.post('/auth/login', payload);
    // api.js interceptor unwraps response.data, so res = { success, message, data: { user, token } }
    if (res.data?.token) {
      localStorage.setItem('shopsphere_token', res.data.token);
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.token) {
      localStorage.setItem('shopsphere_token', res.data.token);
    }
    return res.data;
  },

  logout: async () => {
    localStorage.removeItem('shopsphere_token');
    try {
      await api.post('/auth/logout', {});
    } catch (e) {
      // Ignore logout API errors — token is already cleared locally
    }
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data?.user;
  },
};
