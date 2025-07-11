import api from './api';

export const getAssignedTile = async () => {
  const token = localStorage.getItem("lidarToken");
  if (!token) throw new Error("No token found");

  console.log("📡 Sending request with token:", token);

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

export const submitTile = async ({ tileId, annotationIds, submittedBy,annotationMeta }) => {
  const token = localStorage.getItem("lidarToken");
  if (!token) throw new Error("No token found");
 
  const res = await api.post(
    `/tiles/complete/${tileId}`,
     { annotationIds, submittedBy, annotationMeta },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
 
 