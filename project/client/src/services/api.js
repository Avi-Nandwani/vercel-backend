import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// User API calls
export const getUsers = async (page = 1, limit = 10, search = '') => {
  const response = await api.get(`/users?page=${page}&limit=${limit}&search=${search}`);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const exportUsersCSV = async (search = '') => {
  const response = await api.get(`/users/export?search=${search}`, {
    responseType: 'blob'
  });
  
  // Creating a blob link to download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'users.csv');
  
  // Append to html link element page
  document.body.appendChild(link);
  
  // Start download
  link.click();
  
  // Clean up and remove the link
  link.parentNode.removeChild(link);
};

export default api;