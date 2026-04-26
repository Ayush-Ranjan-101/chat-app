import { motion } from "framer-motion";
import { Users, UserCheck, ShieldBan } from "lucide-react";

const statConfig = [
  {
    label: "Total Users",
    icon: Users,
    color: "from-primary to-accent",
    bgGlow: "primary",
    getValue: (users) => users.length,
  },
  {
    label: "Active Users",
    icon: UserCheck,
    color: "from-emerald-500 to-green-600",
    bgGlow: "success",
    getValue: (users) => users.filter((u) => !u.isBlocked).length,
  },
  {
    label: "Blocked Users",
    icon: ShieldBan,
    color: "from-red-500 to-rose-600",
    bgGlow: "danger",
    getValue: (users) => users.filter((u) => u.isBlocked).length,
  },
];

const StatsCards = ({ users }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {statConfig.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="glass rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
        >
          {/* Glow background */}
          <div
            className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`}
          />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-slate-100">
                {stat.getValue(users)}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
            >
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
