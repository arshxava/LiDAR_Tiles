import axios from "axios";
 



export const saveAnnotationToDB = async (annotation) => {
  const token = localStorage.getItem("lidarToken");
 const baseUrl= process.env.NEXT_PUBLIC_LIDAR_APP_PROD_URL ;
  const res = await fetch(`${baseUrl}/api/annotations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(annotation),
  });

  if (!res.ok) {
    throw new Error("Failed to save annotation");
  }

  const data = await res.json();
  return data; 
};
