import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "/";

const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/");
      if (res.data?.data?.friends !== undefined) {
        set({ authUser: JSON.parse(localStorage.getItem("chat-user")) });
        get().connectSocket();
      }
    } catch {
      set({ authUser: null });
      localStorage.removeItem("chat-user");
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      const user = res.data?.data?.user;
      set({ authUser: user });
      localStorage.setItem("chat-user", JSON.stringify(user));
      get().connectSocket();
      toast.success("Account created successfully!");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Something went wrong during signup";
      toast.error(msg);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      const user = res.data?.data?.user;
      set({ authUser: user });
      localStorage.setItem("chat-user", JSON.stringify(user));
      get().connectSocket();
      toast.success("Logged in successfully!");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Something went wrong during login";
      toast.error(msg);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      localStorage.removeItem("chat-user");
      get().disconnectSocket();
      toast.success("Logged out successfully");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to logout";
      toast.error(msg);
    }
  },

  updateProfile: async (formData) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const user = res.data?.data?.user;
      set({ authUser: user });
      localStorage.setItem("chat-user", JSON.stringify(user));
      toast.success("Profile updated successfully!");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to update profile";
      toast.error(msg);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      query: { userId: authUser._id },
    });

    newSocket.connect();
    set({ socket: newSocket });

    newSocket.on("initialFriendStatus", (onlineFriendIds) => {
      set({ onlineUsers: onlineFriendIds });
    });

    newSocket.on("friendStatusChange", ({ userId, status }) => {
      set((state) => {
        if (status === "online") {
          if (!state.onlineUsers.includes(userId)) {
            return { onlineUsers: [...state.onlineUsers, userId] };
          }
        } else {
          return { onlineUsers: state.onlineUsers.filter((id) => id !== userId) };
        }
        return state;
      });
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));

export default useAuthStore;
