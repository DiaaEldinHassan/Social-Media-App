import axios from "axios";
const url = import.meta.env.VITE_BASE_URL;

const toImageUrl = (key) => {
  if (!key) return key;
  if (key.startsWith("http")) return key;
  return `${url}/users/uploads/${key}`;
};

const mapPost = (post) => {
  if (!post) return post;
  return {
    ...post,
    createdBy: post.createdBy
      ? { ...post.createdBy, profilePicture: toImageUrl(post.createdBy.profilePicture) }
      : post.createdBy,
  };
};

const api = axios.create({ baseURL: url });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data?.data && Array.isArray(response.data.data)) {
      response.data.data = response.data.data.map(mapPost);
    }
    if (response.data?.data && !Array.isArray(response.data.data)) {
      response.data.data = mapPost(response.data.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    return Promise.reject(error);
  },
);

export const postService = {
  getFeed: async (page = 1, limit = 20) => {
    const response = await api.get(`/feed`, { params: { page, limit } });
    return response.data;
  },

  getPosts: async (params = {}) => {
    const response = await api.get(`/posts`, { params });
    return response.data;
  },

  getPost: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  createPost: async (data) => {
    const response = await api.post(`/posts`, data);
    return response.data;
  },

  updatePost: async (postId, data) => {
    const response = await api.patch(`/posts/${postId}`, data);
    return response.data;
  },

  deletePost: async (postId, force = false) => {
    const response = await api.delete(`/posts/${postId}`, {
      params: { force: force ? "true" : undefined },
    });
    return response.data;
  },

  restorePost: async (postId) => {
    const response = await api.patch(`/posts/${postId}/restore`);
    return response.data;
  },

  getUserPosts: async (userId, page = 1, limit = 20) => {
    const response = await api.get(`/users/${userId}/posts`, {
      params: { page, limit },
    });
    return response.data;
  },
};
