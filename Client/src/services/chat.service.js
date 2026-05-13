import axios from "axios";
import { io } from "socket.io-client";

const url = import.meta.env.VITE_BASE_URL;

const api = axios.create({ baseURL: url });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    return Promise.reject(error);
  }
);

export const socket = io("http://localhost:3000");

// ---- DM socket events ----

export const joinChat = (userId) => {
  socket.emit("join", userId);
};

export const sendMessage = (message, senderId, receiverId, replyTo) => {
  socket.emit("message", { message, senderId, receiverId, replyTo });
};

export const onReceiveMessage = (callback) => {
  socket.on("receive_message", callback);
  return () => socket.off("receive_message", callback);
};

export const getConversation = async (userId, page = 1, limit = 50) => {
  const { data } = await api.get(`/messages/${userId}`, {
    params: { page, limit },
  });
  return data.data;
};

// ---- Group socket events ----

export const joinGroupChat = (groupId) => {
  socket.emit("join_group", groupId);
};

export const sendGroupMessage = (message, senderId, groupId, replyTo, mentions) => {
  socket.emit("group_message", { message, senderId, groupId, replyTo, mentions });
};

export const onReceiveGroupMessage = (callback) => {
  socket.on("receive_group_message", callback);
  return () => socket.off("receive_group_message", callback);
};

// ---- Group REST API ----

export const createGroup = async (name, description, memberIds) => {
  const { data } = await api.post("/messages/groups", { name, description, memberIds });
  return data.data;
};

export const getMyGroups = async () => {
  const { data } = await api.get("/messages/groups");
  return data.data;
};

export const getGroupById = async (groupId) => {
  const { data } = await api.get(`/messages/groups/${groupId}`);
  return data.data;
};

export const getGroupMessages = async (groupId, page = 1, limit = 50) => {
  const { data } = await api.get(`/messages/groups/${groupId}/messages`, {
    params: { page, limit },
  });
  return data.data;
};

export const addGroupMembers = async (groupId, memberIds) => {
  const { data } = await api.post(`/messages/groups/${groupId}/members`, { memberIds });
  return data.data;
};

export const removeGroupMember = async (groupId, userId) => {
  const { data } = await api.delete(`/messages/groups/${groupId}/members/${userId}`);
  return data.data;
};
