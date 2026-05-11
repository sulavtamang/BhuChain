import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LandPlot, Activity, MapPin, Users, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getSystemStats } from "../services/api";

export default function HeroSection() {
  const { handleStartRegistration } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getSystemStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch landing stats:", error);
      }
    };
    fetchStats();
  }, []);

  const slideUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", delay },
    }),
  };

  return (
    <section
      id="home"
      className="mt-16 pt-32 pb-20 sm:pb-28 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)" }}>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-3xl -mr-20 -mt-20 rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 blur-3xl -ml-20 -mb-20 rounded-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">


          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideUp}
            custom={0}
            className="space-y-8"
          >

            <h1
              className="text-4xl font-black leading-tight text-gray-900 sm:text-5xl lg:text-7xl tracking-tighter"
              style={{ lineHeight: 1.1 }}
            >
              Secure Land <br />
              Ownership <span className="text-blue-600">for Nepal</span>
            </h1>


            <p className="max-w-xl text-lg text-gray-500 font-medium leading-relaxed">
              Nepal's first blockchain-based land registry system. Verify
              ownership, transfer property, and access tamper-proof records all on-chain.
            </p>


            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => handleStartRegistration(navigate)}
                className="group flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 text-base font-black text-white transition-all duration-300 hover:bg-blue-700 hover:-translate-y-1 shadow-xl shadow-blue-100 active:scale-95"
              >
                Join BhuChain
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/search')}
                className="inline-flex items-center justify-center rounded-2xl border-2 border-gray-200 bg-white px-8 py-4 text-base font-black text-gray-900 transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:text-blue-600 shadow-sm active:scale-95"
              >
                Explore Records
              </button>
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate="visible"
            variants={slideUp}
            custom={0.2}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { label: "Parcels", key: "total_parcels", icon: <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4 }}><LandPlot className="text-blue-600" /></motion.div>, color: "bg-blue-50" },
              { label: "Districts", key: "total_districts", icon: <MapPin className="text-emerald-600" />, color: "bg-emerald-50" },
              { label: "Transfers", key: "total_transfers", icon: <Activity className="text-amber-600" />, color: "bg-amber-50" },
              { label: "Citizens", key: "total_citizens", icon: <Users className="text-purple-600" />, color: "bg-purple-50" }
            ].map((stat, idx) => (
              <div key={idx} className="p-6 rounded-4xl bg-white/60 backdrop-blur-sm border border-white shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all group">
                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                   {stat.icon}
                </div>
                <div className="text-3xl font-black text-gray-900 tracking-tighter">
                  {stats[stat.key] || 0}
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
