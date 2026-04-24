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
  (error) => Promise.reject(error)
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
  }
);

export const authService = {
  signIn: async (userData) => {
    const response = await api.post(`/auth/signIn`, userData);
    return response.data.data;
  },
  signUp: async (userData) => {
    const response = await api.post(`/auth/signUp`, userData);
    return response.data.data;
  },
  confirmOtp: async ({ email, otp }) => {
    const response = await api.post(`/auth/confirmOtp`, { email, otp });
    return response.data.data;
  },
  forgotPassword: async ({ email }) => {
    const response = await api.post(`/auth/forget-password`, { email });
    return response.data;
  },
  resetPassword: async ({ email, otp, newPassword }) => {
    const response = await api.post(`/auth/reset-password`, {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },
  updatePassword: async ({ currentPassword, newPassword }) => {
    const response = await api.patch(`/auth/update-password`, {
      oldPassword: currentPassword,
      newPassword,
    });
    return response.data;
  },
  logout: async () => {
    const response = await api.post(`/auth/logout`);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return response.data;
  },
  logoutAll: async () => {
    const response = await api.post(`/auth/logoutAll`);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get(`/users`);
    return response.data.message;
  },
};
