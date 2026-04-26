import { X } from "lucide-react";
import useChatStore from "../../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();

  const avatarUrl =
    selectedUser?.profilePic ||
    `https://ui-avatars.com/api/?name=${selectedUser?.username || "U"}&background=6366f1&color=fff&size=40`;

  return (
    <div className="h-16 border-b border-slate-700/30 flex items-center justify-between px-4 bg-base-200/30">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={avatarUrl}
            alt={selectedUser?.username}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            {selectedUser?.username}
          </h3>
          <p className="text-xs text-slate-500">Online</p>
        </div>
      </div>

      <button
        onClick={() => setSelectedUser(null)}
        className="p-2 rounded-xl hover:bg-slate-700/40 text-slate-400 hover:text-slate-200 transition-all"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ChatHeader;
