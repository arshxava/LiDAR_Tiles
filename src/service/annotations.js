import axios from "axios";
 
export const saveAnnotationToDB = async (annotation) => {
    const token = localStorage.getItem("lidarToken");
    const res = await axios.post(
        "http://localhost:5000/api/annotations",
        annotation,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return res.data;
};