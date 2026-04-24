import axios from "axios";
const url = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: url,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      console.log("⚠️  Token expired, please log in again");
    }
    return Promise.reject(error);
  },
);

export const userService = {
  getProfile: async () => {
    const response = await api.get(`/users/me`);
    return response.data.user;
  },
  updateProfile: async (userData) => {
    const response = await api.patch(`/users/me`, userData);
    return response.data.user;
  },
  uploadProfilePic: async (file) => {
    const formData = new FormData();
    formData.append("ProfilePic", file);
    const response = await api.post(`/users/profile-pic`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.url;
  },
  prepareVideoUpload: async () => {
    const response = await api.post(`/users/video-upload`);
    return response.data.data;
  },
};
