import axios from 'axios';

const configuredUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const finalBaseUrl = configuredUrl.endsWith('/api') ? configuredUrl : `${configuredUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: finalBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
