// services/map.js
import api from './api';

export const uploadMap = async (formData, token) => {
  const res = await api.post('/maps/upload', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getMaps = async (token) => {
  const res = await api.get('/maps', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteMap = async (mapId, token) => {
  const res = await api.delete(`/maps/${mapId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};