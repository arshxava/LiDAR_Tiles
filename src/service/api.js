// services/api.js
import axios from 'axios';
 const baseUrl= process.env.NEXT_PUBLIC_LIDAR_APP_PROD_URL ;
const api = axios.create({
  baseURL: `${baseUrl}/api`,
});

export default api;
  