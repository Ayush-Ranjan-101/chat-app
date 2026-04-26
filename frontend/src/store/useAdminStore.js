import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const useAdminStore = create((set, get) => ({
  users: [],
  isLoading: false,
  isTogglingBlock: false,
  isDeletingUser: false,

  fetchAllUsers: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/auth/users");
      set({ users: res.data?.data || [] });
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to fetch users";
      toast.error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleBlockUser: async (userId) => {
    set({ isTogglingBlock: true });
    try {
      const res = await axiosInstance.patch("/auth/users", { userId });
      const updatedUser = res.data?.data;
      // Update user in local state
      set({
        users: get().users.map((u) =>
          u._id === updatedUser._id ? { ...u, isBlocked: updatedUser.isBlocked } : u
        ),
      });
      toast.success(res.data?.message || "User status updated");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update user";
      toast.error(msg);
    } finally {
      set({ isTogglingBlock: false });
    }
  },

  deleteUser: async (userId) => {
    set({ isDeletingUser: true });
    try {
      await axiosInstance.delete("/auth/users", { data: { userId } });
      set({ users: get().users.filter((u) => u._id !== userId) });
      toast.success("User account deleted successfully");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to delete user";
      toast.error(msg);
    } finally {
      set({ isDeletingUser: false });
    }
  },
}));

export default useAdminStore;
