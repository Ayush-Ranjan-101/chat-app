import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/");
      if (res.data?.data?.friends !== undefined) {
        set({ authUser: JSON.parse(localStorage.getItem("chat-user")) });
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
}));

export default useAuthStore;
