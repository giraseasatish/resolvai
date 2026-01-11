// client/src/api/axios.ts

import axios from 'axios';

// Create a central "instance" of axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Connects to your backend
});

// The "Interceptor"
// This automatically adds the Token to every request if you are logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // We will store the token here later
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;