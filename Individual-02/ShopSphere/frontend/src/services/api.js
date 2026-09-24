import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const normalizedApiUrl = configuredApiUrl?.replace(/\/$/, '');
const API_BASE_URL = normalizedApiUrl
  ? (normalizedApiUrl.endsWith('/api') ? normalizedApiUrl : `${normalizedApiUrl}/api`)
  : '/api';
const GUEST_ID_KEY = 'shopsphere_guest_id';

function getGuestId() {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
  withCredentials: true,
});

// Request interceptor: attach authentication token and guest tracking
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopsphere_token');
    config.headers['X-Guest-Id'] = getGuestId();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle consistent response format and sanitize errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const responseData = error.response?.data;
    const statusCode = error.response?.status;
    if (statusCode === 401) {
      localStorage.removeItem('shopsphere_token');
      window.dispatchEvent(new Event('shopsphere:unauthorized'));
    }
    const message = responseData?.message || 'Unable to complete request. Please try again.';

    const customError = new Error(message);
    customError.statusCode = statusCode;
    customError.errorCode = responseData?.errorCode || 'API_ERROR';
    customError.data = responseData;

    return Promise.reject(customError);
  }
);

export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
};

export default apiClient;
