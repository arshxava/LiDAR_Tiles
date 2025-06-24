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


export const submitTile = async ({ tileId, annotations }) => {
  const token = localStorage.getItem("lidarToken"); 
  if (!token) throw new Error("No token found");

  const annotationIds = annotations.map(a => a._id || a.id); // extract only IDs

  const res = await api.post(
    `/tiles/complete/${tileId}`,
    { annotations: annotationIds }, // ✅ pass only IDs
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};