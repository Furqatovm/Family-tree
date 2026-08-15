import axios from 'axios';
import { toast } from '../components/ui/CustomToast';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'https://family-tree-k4vh.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('family_tree_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMsg = 'Backend server bilan bog\'lanishda xatolik yuz berdi';

    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data.error === 'string') {
        errorMsg = data.error;
      } else if (typeof data.message === 'string') {
        errorMsg = data.message;
      } else if (data.details) {
        errorMsg = typeof data.details === 'string' ? data.details : JSON.stringify(data.details);
      }
    } else if (error.message) {
      errorMsg = error.message;
    }

    const status = error.response?.status;

    // Trigger custom ultra-modern Toast notification for ANY error!
    toast.error(
      status === 401 ? 'Kirishda Xatolik' : 'Backend Xatoligi',
      errorMsg
    );

    if (status === 401) {
      localStorage.removeItem('family_tree_token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
