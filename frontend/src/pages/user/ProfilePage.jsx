import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, User, Mail, Calendar, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

const ProfilePage = () => {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => { setSelectedImage(reader.result); };
    const formData = new FormData();
    formData.append("profilePic", file);
    await updateProfile(formData);
  };

  const memberSince = authUser?.createdAt
    ? new Date(authUser.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Unknown";

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-lg mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />Back to chats
        </Link>
        <div className="glass rounded-2xl p-8 glow-primary">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold gradient-text">Your Profile</h1>
            <p className="text-slate-400 mt-1">Manage your account info</p>
          </div>
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                <img src={selectedImage || authUser?.profilePic || `https://ui-avatars.com/api/?name=${authUser?.username || "User"}&background=6366f1&color=fff&size=128`} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <label htmlFor="avatar-upload" className={`absolute bottom-1 right-1 w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg ${isUpdatingProfile ? "pointer-events-none animate-pulse" : ""}`}>
                <Camera className="w-5 h-5 text-white" />
                <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUpdatingProfile} />
              </label>
            </div>
            <p className="text-sm text-slate-500 mt-3">{isUpdatingProfile ? "Uploading..." : "Click the camera icon to update"}</p>
          </div>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-slate-400"><User className="w-4 h-4" />Username</div>
              <div className="px-4 py-3 bg-base-100/50 rounded-xl border border-slate-700/30 text-slate-200">{authUser?.username || "—"}</div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-slate-400"><Mail className="w-4 h-4" />Email</div>
              <div className="px-4 py-3 bg-base-100/50 rounded-xl border border-slate-700/30 text-slate-200">{authUser?.email || "—"}</div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-slate-400"><Calendar className="w-4 h-4" />Member Since</div>
              <div className="px-4 py-3 bg-base-100/50 rounded-xl border border-slate-700/30 text-slate-200">{memberSince}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
