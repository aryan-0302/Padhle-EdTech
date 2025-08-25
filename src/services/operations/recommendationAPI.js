import { apiConnector } from "../apniconnect.js";
import { toast } from "react-hot-toast";
import { recommendEndpoint } from "../apis.js";


export const getRecommendedCourses = async (token) => {
    const toastId = toast.loading("Loading...");
    try {
        const response = await apiConnector("GET", `${recommendEndpoint.RECOMMENDED_COURSES}/${userId}`, null, {
            Authorization: `Bearer ${token}`,
        });

        toast.dismiss(toastId);  
        return response.data;
    } catch (error) {
        console.error("Error fetching recommended courses:", error);
        toast.dismiss(toastId);  
        return { recommendations: [] };
    }
};
