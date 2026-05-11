import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, Home, ArrowLeft, Search } from "lucide-react";

//NotFoundPage 
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center space-y-8"
      >
        {/* Animated Icon */}
        <div className="relative inline-block">
          <motion.div 
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-gray-100"
          >
            <Shield size={48} className="text-blue-600" />
          </motion.div>
          <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-2 rounded-full border-4 border-white shadow-lg">
            <Search size={16} />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-black text-gray-900 tracking-tighter">404</h1>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Record Not Found</h2>
          <p className="text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">
            The registry page you are looking for has either been moved, deleted, or never existed in the blockchain ledger.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-black text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 rounded-2xl text-sm font-black text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            <Home size={18} />
            Return Home
          </button>
        </div>

        <div className="pt-12 border-t border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
            BhuChain Security Protocol
          </p>
        </div>
      </motion.div>
    </div>
  );
}
