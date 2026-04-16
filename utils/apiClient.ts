import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
export const backendRoot = API_BASE_URL.replace('/api', '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const clearAdminAuth = () => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem('adminToken');
};

// Handle auth errors and token management
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      clearAdminAuth();
      console.warn('Authentication required. Please log in to access admin features.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
