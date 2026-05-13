import axios from "axios";
const url = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: url,
});

const toImageUrl = (key) => {
  if (!key) return key;
  if (key.startsWith("http")) return key;
  return `${url}/users/uploads/${key}`;
};

const mapUser = (user) => {
  if (!user) return user;
  return { ...user, profilePicture: toImageUrl(user.profilePicture) };
};

const mapFriend = (friend) => {
  if (!friend) return friend;
  return {
    ...friend,
    friendId: mapUser(friend.friendId),
  };
};

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
    return mapUser(response.data.user);
  },
  updateProfile: async (userData) => {
    const response = await api.patch(`/users/me`, userData);
    return mapUser(response.data.user);
  },
  uploadProfilePic: async (file) => {
    const formData = new FormData();
    formData.append("ProfilePic", file);
    const response = await api.post(`/users/profile-pic`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return toImageUrl(response.data.url);
  },
  prepareVideoUpload: async () => {
    const response = await api.post(`/users/video-upload`);
    return response.data.data;
  },
  getFriends: async () => {
    const response = await api.get(`/users/my-friends`);
    return (response.data.friends || []).map(mapFriend);
  },
  sendFriendRequest: async (friendId) => {
    const response = await api.post(`/users/add-friend/${friendId}`);
    return response.data;
  },
  acceptFriendRequest: async (friendId) => {
    const response = await api.post(`/users/accept-friend/${friendId}`);
    return response.data;
  },
  searchUsers: async (searchString) => {
    const response = await api.post(`/users/search-user`, { searchString });
    return (response.data || []).map(mapUser);
  },
  getPendingRequests: async () => {
    const response = await api.get(`/users/pending-requests`);
    return (response.data.requests || []).map(mapFriend);
  },
};
