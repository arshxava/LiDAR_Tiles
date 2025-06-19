// services/user.js
import api from './api';

export const getCurrentUser = async (token) => {
  const res = await api.get('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getAllUsers = async () => {
  const res = await api.get('/users');
  return res.data;
};

// Optional - for SuperAdmin only
export const updateUserRole = async (userId, role, token) => {
  const res = await api.put(
    '/users/role',
    { userId, role },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};
