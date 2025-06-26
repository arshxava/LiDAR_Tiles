import axios from "axios";
 
// export const saveAnnotationToDB = async (annotation) => {
//     const token = localStorage.getItem("lidarToken");
//     const res = await axios.post(
//         "http://localhost:5000/api/annotations",
//         annotation,
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         }
//     );
//     return res.data;
// };


export const saveAnnotationToDB = async (annotation) => {
  const token = localStorage.getItem("lidarToken");

  const res = await fetch("http://localhost:5000/api/annotations", {
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
