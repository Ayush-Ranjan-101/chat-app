import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Users,
  UserPlus,
  Search,
  UserCheck,
  UserX,
  UserMinus,
  Loader2,
} from "lucide-react";
import useFriendStore from "../store/useFriendStore";
import useChatStore from "../store/useChatStore";

const TABS = [
  { id: "chats", label: "Chats", icon: MessageCircle },
  { id: "discover", label: "Discover", icon: Users },
  { id: "requests", label: "Requests", icon: UserPlus },
];

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("chats");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    friends,
    potentialFriends,
    friendRequests,
    isLoading,
    getFriends,
    getPotentialFriends,
    showFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    discardFriendRequest,
    removeFriend,
  } = useFriendStore();

  const { selectedUser, setSelectedUser } = useChatStore();

  useEffect(() => {
    getFriends();
  }, [getFriends]);

  useEffect(() => {
    if (activeTab === "discover") getPotentialFriends();
    if (activeTab === "requests") showFriendRequests();
  }, [activeTab, getPotentialFriends, showFriendRequests]);

  const filteredFriends = friends.filter((f) =>
    f.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPotential = potentialFriends.filter((u) =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = friendRequests.filter((r) =>
    r.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAvatarUrl = (user) =>
    user?.profilePic ||
    `https://ui-avatars.com/api/?name=${user?.username || "U"}&background=6366f1&color=fff&size=40`;

  return (
    <aside className="w-80 min-w-[320px] border-r border-slate-700/30 flex flex-col bg-base-200/50 h-full">
      {/* Tabs */}
      <div className="flex border-b border-slate-700/30">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchQuery("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 relative ${
              activeTab === tab.id
                ? "text-primary-light"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.id === "requests" && friendRequests.length > 0 && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {friendRequests.length}
              </span>
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent"
              />
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-10 pr-4 py-2.5 bg-base-100/60 border border-slate-700/40 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {/* Chats tab */}
            {activeTab === "chats" && (
              <>
                {filteredFriends.length === 0 ? (
                  <EmptyState message="No friends yet. Go to Discover to find people!" />
                ) : (
                  filteredFriends.map((friend, i) => (
                    <motion.button
                      key={friend._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedUser(friend)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group mb-1 ${
                        selectedUser?._id === friend._id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-slate-700/30"
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={getAvatarUrl(friend)}
                          alt={friend.username}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-600/50"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {friend.username}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          Click to start chatting
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFriend(friend._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
                        title="Remove friend"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </motion.button>
                  ))
                )}
              </>
            )}

            {/* Discover tab */}
            {activeTab === "discover" && (
              <>
                {filteredPotential.length === 0 ? (
                  <EmptyState message="No new people to discover right now." />
                ) : (
                  filteredPotential.map((user, i) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/30 transition-all mb-1"
                    >
                      <img
                        src={getAvatarUrl(user)}
                        alt={user.username}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-600/50"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {user.username}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => sendFriendRequest(user._id)}
                        className="px-3 py-1.5 bg-primary/15 text-primary-light text-xs font-semibold rounded-lg hover:bg-primary/25 transition-colors flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Add
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </>
            )}

            {/* Requests tab */}
            {activeTab === "requests" && (
              <>
                {filteredRequests.length === 0 ? (
                  <EmptyState message="No pending friend requests." />
                ) : (
                  filteredRequests.map((req, i) => (
                    <motion.div
                      key={req._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/30 transition-all mb-1"
                    >
                      <img
                        src={getAvatarUrl(req)}
                        alt={req.username}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-600/50"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {req.username}
                        </p>
                        <p className="text-xs text-slate-500">{req.email}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => acceptFriendRequest(req._id)}
                          className="p-2 bg-success/15 text-success rounded-lg hover:bg-success/25 transition-colors"
                          title="Accept"
                        >
                          <UserCheck className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => discardFriendRequest(req._id)}
                          className="p-2 bg-danger/15 text-danger rounded-lg hover:bg-danger/25 transition-colors"
                          title="Decline"
                        >
                          <UserX className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                )}
              </>
            )}
          </AnimatePresence>
        )}
      </div>
    </aside>
  );
};

const EmptyState = ({ message }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-12 px-4 text-center"
  >
    <div className="w-14 h-14 rounded-2xl bg-slate-700/30 flex items-center justify-center mb-3">
      <Users className="w-7 h-7 text-slate-500" />
    </div>
    <p className="text-sm text-slate-500">{message}</p>
  </motion.div>
);

export default Sidebar;
