import { useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import useAdminStore from "../../store/useAdminStore";
import StatsCards from "../../components/admin/StatsCards";
import UserTable from "../../components/admin/UserTable";

const AdminPage = () => {
  const { users, isLoading, isTogglingBlock, isDeletingUser, fetchAllUsers, toggleBlockUser, deleteUser } = useAdminStore();

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to chats
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center glow-accent">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
              <p className="text-slate-400 text-sm mt-0.5">Manage users and monitor your platform</p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-slate-500">Loading users...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8">
              <StatsCards users={users} />
            </div>

            {/* User Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-slate-200 mb-4">User Management</h2>
              <UserTable
                users={users}
                onToggleBlock={toggleBlockUser}
                onDeleteUser={deleteUser}
                isTogglingBlock={isTogglingBlock}
                isDeletingUser={isDeletingUser}
              />
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
