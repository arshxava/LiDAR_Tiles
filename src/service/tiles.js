// services/tile.js
import api from './api';

export const getAssignedTile = async (token) => {
  const res = await api.get('/tiles/assigned', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const submitTile = async (tileData, token) => {
  const res = await api.post('/tiles/submit', tileData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
