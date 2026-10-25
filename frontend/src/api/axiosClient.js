import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refresh = localStorage.getItem("refresh_token");
            if (refresh) {
                try {
                    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                        refresh,
                    });
                    localStorage.setItem("access_token", data.access);
                    if (data.refresh) {
                        localStorage.setItem("refresh_token", data.refresh);
                    }
                    originalRequest.headers.Authorization = `Bearer ${data.access}`;
                    return axiosClient(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;