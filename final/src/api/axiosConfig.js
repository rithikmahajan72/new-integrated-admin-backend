import axios from 'axios';

let baseURL = import.meta.env.VITE_API_BASE_URL;
if (!baseURL || baseURL.includes('3000') || baseURL.includes('3001')) {
  baseURL = 'http://localhost:8080/api';
}

const API = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
