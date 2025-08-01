import api from './api';

export const getAssignedTile = async () => {
  const token = localStorage.getItem("lidarToken");
  if (!token) throw new Error("No token found");

  // console.log("📡 Sending request with token:", token);

  const res = await api.post(
    "/tiles/assign",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const submitTile = async ({ tileId, annotationIds, submittedBy }) => {
  const token = localStorage.getItem("lidarToken");
  if (!token) throw new Error("No token found");
 
  const res = await api.post(
    `/tiles/complete/${tileId}`,
     { annotationIds, submittedBy },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
 
 
export const markTileAsNoEcho = async ({ tileId, submittedBy }) => {
  const token = localStorage.getItem("lidarToken");
  if (!token) throw new Error("No token found");

  const res = await api.post(
    `/tiles/mark-no-echo/${tileId}`,
    { submittedBy }, // no annotationIds
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};
