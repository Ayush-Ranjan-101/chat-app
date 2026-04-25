import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Image, X } from "lucide-react";
import useChatStore from "../store/useChatStore";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage, selectedUser } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;

    setIsSending(true);
    const formData = new FormData();
    if (text.trim()) formData.append("text", text.trim());
    if (imageFile) formData.append("image", imageFile);

    await sendMessage(selectedUser._id, formData);

    setText("");
    removeImage();
    setIsSending(false);
  };

  return (
    <div className="border-t border-slate-700/30 bg-base-200/30">
      {/* Image preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-3"
          >
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 rounded-lg object-cover border border-slate-600/50"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <form onSubmit={handleSend} className="flex items-center gap-2 p-3">
        {/* Image upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl hover:bg-slate-700/40 text-slate-400 hover:text-primary-light transition-all"
        >
          <Image className="w-5 h-5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />

        {/* Text input */}
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 bg-base-100/50 border border-slate-700/40 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isSending || (!text.trim() && !imageFile)}
          className="p-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {isSending ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default MessageInput;
