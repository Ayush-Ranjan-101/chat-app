import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Pencil, Trash2, X, Check } from "lucide-react";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";

const ChatContainer = () => {
  const { messages, selectedUser, isMessagesLoading, getMessages, updateMessage, deleteMessage } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");

  const handleEditClick = (message) => {
    setEditingMessageId(message._id);
    setEditText(message.text || "");
  };

  const handleUpdateMessage = async (messageId) => {
    if (!editText.trim()) {
      setEditingMessageId(null);
      return;
    }
    await updateMessage(selectedUser._id, messageId, editText);
    setEditingMessageId(null);
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(selectedUser._id, messageId);
    }
  };

  useEffect(() => {
    if (selectedUser?._id) getMessages(selectedUser._id);
  }, [selectedUser?._id, getMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const formatDateHeader = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }
  };

  const getAvatarUrl = (user) =>
    user?.profilePic || `https://ui-avatars.com/api/?name=${user?.username || "U"}&background=6366f1&color=fff&size=36`;

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-slate-500">Loading messages...</p>
          </div>
        </div>
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-700/30 flex items-center justify-center mx-auto mb-4">
                <img src={getAvatarUrl(selectedUser)} alt="" className="w-12 h-12 rounded-full object-cover" />
              </div>
              <p className="text-slate-400 text-sm">
                No messages yet with <span className="text-primary-light font-medium">{selectedUser?.username}</span>
              </p>
              <p className="text-slate-500 text-xs mt-1">Say hello to start the conversation!</p>
            </div>
          </div>
        ) : (
          [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((message, i, sortedArr) => {
            const isMine = message.senderId === authUser?._id || message.senderId?._id === authUser?._id;
            
            const messageDate = new Date(message.createdAt).toDateString();
            const prevMessageDate = i > 0 ? new Date(sortedArr[i - 1].createdAt).toDateString() : null;
            const showDateHeader = messageDate !== prevMessageDate;

            const showAvatar = i === 0 || showDateHeader || sortedArr[i - 1]?.senderId !== message.senderId;

            return (
              <div key={message._id} className="flex flex-col">
                {showDateHeader && (
                  <div className="flex justify-center my-4">
                    <span className="bg-slate-800/50 text-slate-400 text-xs px-3 py-1 rounded-full border border-slate-700/50">
                      {formatDateHeader(message.createdAt)}
                    </span>
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.5) }}
                  className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"} ${showAvatar ? "mt-4" : "mt-0.5"}`}
                >
                  {!isMine && showAvatar && <img src={getAvatarUrl(selectedUser)} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />}
                  {!isMine && !showAvatar && <div className="w-7 flex-shrink-0" />}
                  <div className={`group relative max-w-[70%] px-4 py-2.5 ${isMine ? "bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl rounded-br-md" : "bg-surface-light text-slate-200 rounded-2xl rounded-bl-md"}`}>
                    {message.image && <img src={message.image} alt="Attachment" className="max-w-full rounded-lg mb-2 max-h-60 object-cover" />}
                    
                    {editingMessageId === message._id ? (
                      <div className="flex flex-col gap-2 mt-1">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="text-sm bg-white/20 text-white placeholder-white/50 rounded px-2 py-1.5 outline-none border border-white/30 focus:border-white/60 w-full"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdateMessage(message._id);
                            if (e.key === "Escape") setEditingMessageId(null);
                          }}
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingMessageId(null)} className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Cancel"><X className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleUpdateMessage(message._id)} className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors" title="Save"><Check className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {message.text && <p className="text-sm leading-relaxed break-words">{message.text}</p>}
                        <p className={`text-[10px] mt-1 ${isMine ? "text-white/50" : "text-slate-500"} text-right`}>{formatTime(message.createdAt)}</p>
                      </>
                    )}

                    {isMine && editingMessageId !== message._id && (
                      <div className="absolute top-1/2 -translate-y-1/2 -left-[4.5rem] hidden group-hover:flex items-center gap-1 bg-slate-800/90 px-1.5 py-1.5 rounded-xl shadow-lg border border-slate-700/50 backdrop-blur-sm">
                        <button onClick={() => handleEditClick(message)} className="p-1.5 text-slate-400 hover:text-primary-light hover:bg-slate-700/50 rounded-lg transition-all" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteMessage(message._id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {isMine && showAvatar && <img src={getAvatarUrl(authUser)} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />}
                  {isMine && !showAvatar && <div className="w-7 flex-shrink-0" />}
                </motion.div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
