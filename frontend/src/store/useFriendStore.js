import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const useFriendStore = create((set, get) => ({
  friends: [],
  potentialFriends: [],
  friendRequests: [],
  isLoading: false,

  getFriends: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/auth/");
      set({ friends: res.data?.data?.friends || [] });
    } catch (error) {
      console.error("Failed to fetch friends:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  getPotentialFriends: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/auth/friends");
      set({ potentialFriends: res.data?.data?.Allusers || [] });
    } catch (error) {
      console.error("Failed to fetch potential friends:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  sendFriendRequest: async (targetUserId) => {
    try {
      await axiosInstance.post("/auth/friends", { targetUserId });
      toast.success("Friend request sent!");
      set((state) => ({
        potentialFriends: state.potentialFriends.filter(
          (u) => u._id !== targetUserId
        ),
      }));
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to send friend request";
      toast.error(msg);
    }
  },

  showFriendRequests: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/auth/friends/requests");
      set({ friendRequests: res.data?.data?.requests || [] });
    } catch (error) {
      console.error("Failed to fetch friend requests:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  acceptFriendRequest: async (requesterId) => {
    try {
      await axiosInstance.post("/auth/friends/requests", { requesterId });
      toast.success("Friend request accepted!");
      set((state) => ({
        friendRequests: state.friendRequests.filter(
          (r) => r._id !== requesterId
        ),
      }));
      get().getFriends();
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to accept friend request";
      toast.error(msg);
    }
  },

  discardFriendRequest: async (requestedId) => {
    try {
      await axiosInstance.delete("/auth/friends/requests", {
        data: { requestedId },
      });
      toast.success("Friend request declined");
      set((state) => ({
        friendRequests: state.friendRequests.filter(
          (r) => r._id !== requestedId
        ),
      }));
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to decline friend request";
      toast.error(msg);
    }
  },

  removeFriend: async (targetUserId) => {
    try {
      await axiosInstance.delete("/auth/", { data: { targetUserId } });
      toast.success("Friend removed");
      set((state) => ({
        friends: state.friends.filter((f) => f._id !== targetUserId),
      }));
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to remove friend";
      toast.error(msg);
    }
  },
}));

export default useFriendStore;
