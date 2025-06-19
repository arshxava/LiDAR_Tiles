// services/auth.js
import api from './api';

export const register = async (formData) => {
  const res = await api.post('/auth/register', formData);
  return res.data;
};

export const login = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  return res.data; // will contain token and user
};
