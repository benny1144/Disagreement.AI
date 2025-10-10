import axios from 'axios';

// Determine API base URL dynamically to work in both local dev and production
const envApi = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined;
// Prefer VITE_API_URL if provided; otherwise, if the API is served from same origin under /api, use relative path
const API_BASE = envApi && String(envApi).trim() !== '' ? envApi.replace(/\/$/, '') : '';

// Build full users endpoint base
const API_URL = API_BASE ? `${API_BASE}/api/users/` : '/api/users/';

// Register user
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}register`, userData, { withCredentials: false });
  if (response?.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Login user
export const login = async (userData) => {
  const response = await axios.post(`${API_URL}login`, userData, { withCredentials: false });
  if (response?.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('user');
};

const authService = { register, login, logout };
export default authService;
