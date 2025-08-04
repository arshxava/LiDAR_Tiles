// src/services/contactus.js
import api from './api';

export const sendContactMessage = async (data) => {
  try {
    const response = await api.post('/contactus', data);
    return response.data;
  } catch (error) {
    console.error('Error sending contact message:', error);
    throw error.response?.data || { error: 'Failed to send message' };
  }
};
