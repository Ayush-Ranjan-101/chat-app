import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";

const ChatContainer = () => {
  const { messages, selectedUser, isMessagesLoading, getMessages } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

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
          messages.map((message, i) => {
            const isMine = message.senderId === authUser?._id || message.senderId?._id === authUser?._id;
            const showAvatar = i === 0 || messages[i - 1]?.senderId !== message.senderId;
            return (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
                className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"} ${showAvatar ? "mt-4" : "mt-0.5"}`}
              >
                {!isMine && showAvatar && <img src={getAvatarUrl(selectedUser)} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />}
                {!isMine && !showAvatar && <div className="w-7 flex-shrink-0" />}
                <div className={`max-w-[70%] px-4 py-2.5 ${isMine ? "bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl rounded-br-md" : "bg-surface-light text-slate-200 rounded-2xl rounded-bl-md"}`}>
                  {message.image && <img src={message.image} alt="Attachment" className="max-w-full rounded-lg mb-2 max-h-60 object-cover" />}
                  {message.text && <p className="text-sm leading-relaxed break-words">{message.text}</p>}
                  <p className={`text-[10px] mt-1 ${isMine ? "text-white/50" : "text-slate-500"} text-right`}>{formatTime(message.createdAt)}</p>
                </div>
                {isMine && showAvatar && <img src={getAvatarUrl(authUser)} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />}
                {isMine && !showAvatar && <div className="w-7 flex-shrink-0" />}
              </motion.div>
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
