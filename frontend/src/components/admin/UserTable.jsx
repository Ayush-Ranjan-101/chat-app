import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ShieldBan, ShieldCheck, Trash2, Loader2 } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "blocked", label: "Blocked" },
];

const UserTable = ({ users, onToggleBlock, onDeleteUser, isTogglingBlock, isDeletingUser }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [modal, setModal] = useState({ open: false, type: null, user: null });

  const filteredUsers = users
    .filter((u) => {
      if (activeFilter === "active") return !u.isBlocked;
      if (activeFilter === "blocked") return u.isBlocked;
      return true;
    })
    .filter((u) =>
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getAvatarUrl = (user) =>
    user?.profilePic || `https://ui-avatars.com/api/?name=${user?.username || "U"}&background=6366f1&color=fff&size=40`;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleConfirm = async () => {
    if (modal.type === "block") {
      await onToggleBlock(modal.user._id);
    } else if (modal.type === "delete") {
      await onDeleteUser(modal.user._id);
    }
    setModal({ open: false, type: null, user: null });
  };

  return (
    <>
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-base-100/60 border border-slate-700/40 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 bg-base-100/40 rounded-xl p-1 border border-slate-700/30">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeFilter === tab.id
                  ? "bg-primary/20 text-primary-light"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/30">
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="text-right px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500 text-sm">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-700/15 hover:bg-slate-700/10 transition-colors group"
                  >
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getAvatarUrl(user)}
                          alt={user.username}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-600/50"
                        />
                        <span className="text-sm font-medium text-slate-200">{user.username}</span>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-400">{user.email}</span>
                    </td>
                    {/* Role */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        user.role === "admin"
                          ? "bg-violet-500/15 text-violet-400"
                          : "bg-slate-600/20 text-slate-400"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        user.isBlocked
                          ? "bg-red-500/15 text-red-400"
                          : "bg-emerald-500/15 text-emerald-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isBlocked ? "bg-red-400" : "bg-emerald-400"}`} />
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    {/* Joined */}
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-500">{formatDate(user.createdAt)}</span>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setModal({ open: true, type: "block", user })}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isBlocked
                              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                          }`}
                          title={user.isBlocked ? "Unblock user" : "Block user"}
                        >
                          {user.isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setModal({ open: true, type: "delete", user })}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, type: null, user: null })}
        onConfirm={handleConfirm}
        isLoading={modal.type === "block" ? isTogglingBlock : isDeletingUser}
        isDanger={modal.type === "delete"}
        title={
          modal.type === "delete"
            ? `Delete ${modal.user?.username}?`
            : modal.user?.isBlocked
              ? `Unblock ${modal.user?.username}?`
              : `Block ${modal.user?.username}?`
        }
        description={
          modal.type === "delete"
            ? "This will permanently delete this user's account and all their data. This action cannot be undone."
            : modal.user?.isBlocked
              ? "This user will be able to log in and use the app again."
              : "This user will be logged out and unable to access the app until unblocked."
        }
        confirmText={
          modal.type === "delete"
            ? "Delete Account"
            : modal.user?.isBlocked
              ? "Unblock"
              : "Block User"
        }
      />
    </>
  );
};

export default UserTable;
