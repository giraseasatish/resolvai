// client/src/api/axios.ts

import axios from 'axios';

// 1. Define the URL based on where the app is running
// If on "localhost"  use port 5000.
// If on the internet (Vercel), use the Render link.
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://resolvai-backend.onrender.com';

// 2. Create the central "instance" of axios using that URL
const api = axios.create({
  baseURL: BASE_URL, 
});

// The "Interceptor" 
// This automatically adds the Token to every request logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;