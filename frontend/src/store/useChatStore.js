import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import useAuthStore from "./useAuthStore";

const useChatStore = create((set, get) => ({
  messages: [],
  selectedUser: null,
  isMessagesLoading: false,

  setSelectedUser: (user) => set({ selectedUser: user, messages: [] }),

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data?.data?.messages || [] });
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast.error("Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (receiverId, formData) => {
    try {
      const res = await axiosInstance.post(
        `/messages/send/${receiverId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const newMessage = res.data?.data?.newMessage;
      if (newMessage) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to send message";
      toast.error(msg);
    }
  },

  updateMessage: async (userId, messageId, text) => {
    try {
      const res = await axiosInstance.patch(`/messages/${userId}/update`, {
        messageId,
        text,
      });
      const updatedMessage = res.data?.data?.message;
      if (updatedMessage) {
        set((state) => ({
          messages: state.messages.map((m) =>
            m._id === messageId ? updatedMessage : m
          ),
        }));
      }
      toast.success("Message updated");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to update message";
      toast.error(msg);
    }
  },

  deleteMessage: async (userId, messageId) => {
    try {
      await axiosInstance.delete(`/messages/${userId}/delete`, {
        data: { messageId },
      });
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== messageId),
      }));
      toast.success("Message deleted");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to delete message";
      toast.error(msg);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;
      set({
        messages: [...get().messages, newMessage],
      });
    });

    socket.on("messageUpdated", (updatedMessage) => {
      set({
        messages: get().messages.map((m) =>
          m._id === updatedMessage._id ? updatedMessage : m
        ),
      });
    });

    socket.on("messageDeleted", ({ messageId }) => {
      set({
        messages: get().messages.filter((m) => m._id !== messageId),
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("messageUpdated");
    socket.off("messageDeleted");
  },
}));

export default useChatStore;
