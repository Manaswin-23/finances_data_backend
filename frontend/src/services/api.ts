import { jwtDecode } from 'jwt-decode';

export const API_URL = '/api';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token: string) => localStorage.setItem('token', token);
export const clearAuthToken = () => localStorage.removeItem('token');

export const getCurrentUser = () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    return jwtDecode(token) as { id: string, role: string, name: string, status: string };
  } catch (e) {
    return null;
  }
};

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
      window.location.href = '/login';
    }
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
};
