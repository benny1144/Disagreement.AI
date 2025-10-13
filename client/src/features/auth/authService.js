import axios from 'axios';

// Get the API URL from the Vite environment variables.
// In development, this will be undefined, and the Vite proxy will be used.
// In production, this MUST be set to the full URL of the deployed backend.
const API_URL = import.meta.env.VITE_API_URL || '';

// Create the full base path for user authentication routes.
// If API_URL is set, it will be e.g., "[https://backend.com/api/users/](https://backend.com/api/users/)".
// If it's not set (in dev), it will be "/api/users/", which the Vite proxy will handle.
const USER_API_BASE = `${API_URL}/api/users/`;

console.log(`[authService] API requests will be sent to: ${USER_API_BASE}`);

// Register user
const register = async (userData) => {
  const response = await axios.post(`${USER_API_BASE}register`, userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(`${USER_API_BASE}login`, userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

const authService = {
  register,
  login,
  logout,
};

export default authService;
