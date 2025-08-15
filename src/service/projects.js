// services/project.js
import api from './api';


export const getProjects = async () => {
  const token = localStorage.getItem("lidarToken");
  const res = await api.get('/projects', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};


export const addProject = async (projectData) => {
  const token = localStorage.getItem("lidarToken");
  const res = await api.post('/projects/add', projectData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json', // explicitly set like uploadMap style
    },
  });
  return res.data;
};


export const deleteProject = async (id) => {
  const token = localStorage.getItem("lidarToken");
  const res = await api.delete(`/projects/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
