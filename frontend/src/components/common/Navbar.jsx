import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, User, LogOut, Shield } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-strong fixed top-0 left-0 right-0 z-50 h-16"
    >
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-100 tracking-tight">
            Chat<span className="text-primary-light">App</span>
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Admin link — only visible to admins */}
          {authUser?.role === "admin" && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-violet-500/10 transition-all duration-200 group"
            >
              <Shield className="w-5 h-5 text-accent-light group-hover:text-accent transition-colors" />
              <span className="text-sm text-slate-300 hidden sm:inline group-hover:text-accent-light transition-colors">
                Admin
              </span>
            </Link>
          )}

          <Link
            to="/profile"
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-700/40 transition-all duration-200 group"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
              <img
                src={
                  authUser?.profilePic ||
                  `https://ui-avatars.com/api/?name=${authUser?.username || "U"}&background=6366f1&color=fff&size=28`
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm text-slate-300 hidden sm:inline">
              {authUser?.username}
            </span>
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
