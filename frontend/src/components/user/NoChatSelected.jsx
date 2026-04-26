import { motion } from "framer-motion";
import { MessageSquare, ArrowLeft } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-base-100/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-sm px-4"
      >
        {/* Animated icon */}
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6 glow-primary"
        >
          <MessageSquare className="w-10 h-10 text-primary-light" />
        </motion.div>

        <h2 className="text-2xl font-bold gradient-text mb-3">
          Welcome to ChatApp
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          Select a friend from the sidebar to start chatting, or discover new
          people to connect with.
        </p>

        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Pick a conversation to begin</span>
        </div>
      </motion.div>
    </div>
  );
};

export default NoChatSelected;
