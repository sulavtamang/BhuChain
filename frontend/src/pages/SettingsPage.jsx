import React from "react";
import { useAuth } from "../context/AuthContext";
import { 
  User, 
  ShieldCheck, 
  Wallet, 
  Mail, 
  CreditCard, 
  LogOut,
  AlertCircle,
  RefreshCw,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import KYCUpdateModal from "../components/KYCUpdateModal";
import { getKYCUpdates } from "../services/api";

import { getImageUrl } from "../utils/media";

export default function SettingsPage() {
  const { user, walletAddress, logout, switchWallet, isOfficer } = useAuth();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [activeRequest, setActiveRequest] = React.useState(null);

  React.useEffect(() => {
    if (user && !isOfficer) {
      loadActiveRequest();
    }
  }, [user, isOfficer]);

  const loadActiveRequest = async () => {
    try {
      const data = await getKYCUpdates();
      const updatesList = data.results || data;
      const pending = Array.isArray(updatesList) ? updatesList.find(u => u.status === 'Pending') : null;
      setActiveRequest(pending);
    } catch (err) {
      console.error("Failed to load active requests", err);
    }
  };

  return (
    <div className="space-y-8 pb-10 max-w-4xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-gray-400 font-medium text-sm">Manage your decentralized identity and profile details on BhuChain.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-white rounded-2rem border border-gray-100 p-8 flex flex-col items-center text-center shadow-sm"
          >
            <div className="relative mb-4">
              {user?.profile_picture ? (
                <img 
                  src={getImageUrl(user.profile_picture)} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border-4 border-white shadow-lg shadow-blue-100">
                  <User size={40} />
                </div>
              )}
              {user?.is_verified && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <ShieldCheck size={14} className="text-white" />
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-black text-gray-900">{user?.full_name || "Unknown User"}</h2>
            <div className={`mt-2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
              isOfficer 
                 ? "bg-amber-100 text-amber-700 border border-amber-200" 
                 : "bg-blue-50 text-blue-600 border border-blue-100"
            }`}>
              {user?.role || "Citizen"} Account
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Card Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">Wallet</h3>
                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </span>
              </div>
              {/* Wallet Address Chip */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <Wallet size={14} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Active Address</p>
                  <p className="font-mono text-[10px] font-bold text-gray-700 truncate">
                    {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}` : "Not Connected"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 space-y-2">
              <button
                onClick={switchWallet}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-2xl text-sm font-black text-gray-600 hover:text-blue-700 transition-all active:scale-[0.98] group"
              >
                <div className="w-8 h-8 bg-white group-hover:bg-blue-100 border border-gray-100 group-hover:border-blue-200 rounded-xl flex items-center justify-center transition-colors">
                  <RefreshCw size={14} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black">Switch Wallet</p>
                  <p className="text-[10px] font-bold text-gray-400">Connect a different address</p>
                </div>
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 rounded-2xl text-sm font-black text-rose-600 hover:text-rose-700 transition-all active:scale-[0.98] group"
              >
                <div className="w-8 h-8 bg-white group-hover:bg-rose-100 border border-rose-100 group-hover:border-rose-200 rounded-xl flex items-center justify-center transition-colors">
                  <LogOut size={14} className="text-rose-500 transition-colors" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black">Disconnect</p>
                  <p className="text-[10px] font-bold text-rose-400">Sign out of BhuChain</p>
                </div>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Identity Details */}
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2rem border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 sm:p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
               <div>
                  <h2 className="text-lg font-black text-gray-900">Registry Identity</h2>
                  <p className="text-xs font-bold text-gray-400">Verified details associated with your BhuChain account.</p>
               </div>
                <ShieldCheck className="text-emerald-500" size={32} />
            </div>

            <div className="p-6 sm:p-8 space-y-6">
               {!isOfficer && (
                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-blue-50/50 border border-blue-100 rounded-3xl">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                        {activeRequest ? <Clock size={20} className="text-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" /> : <RefreshCw size={20} />}
                     </div>
                     <div>
                       <h4 className="text-sm font-black text-gray-900">Identity Information</h4>
                       <p className="text-[11px] font-bold text-gray-400">
                         {activeRequest ? "You have a pending amendment request." : "Update your legal credentials or documents."}
                       </p>
                     </div>
                   </div>
                   <button 
                     disabled={!!activeRequest}
                     onClick={() => setIsUpdateModalOpen(true)}
                     className={`px-6 py-3 rounded-xl text-sm font-black transition-all ${
                       activeRequest 
                         ? "bg-amber-100 text-amber-700 border border-amber-200 cursor-not-allowed" 
                         : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                     }`}
                   >
                     {activeRequest ? "Amendment Pending" : "Request Update"}
                   </button>
                 </div>
               )}

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {/* Name */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                       <User size={12} /> Full Legal Name
                    </label>
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800">
                       {user?.full_name}
                    </div>
                 </div>

                 {/* Email */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                       <Mail size={12} /> Email Address
                    </label>
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800 truncate">
                       {user?.email || "Not Provided"}
                    </div>
                 </div>

                 {/* Citizenship */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                       <CreditCard size={12} /> Citizenship Number
                    </label>
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800">
                       {user?.citizenship_no || "Not Provided"}
                    </div>
                 </div>

                 {/* Wallet */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                       <Wallet size={12} /> Connected Wallet
                    </label>
                    <div className="p-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl font-mono text-xs font-bold break-all">
                       {walletAddress}
                    </div>
                 </div>
               </div>

               <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-xs font-black text-amber-900">Immutable Records</h4>
                    <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                       Your identity profile is cryptographically linked to your MetaMask wallet address. For security reasons and fraud prevention, changing your legal name or citizenship number requires submitting a formal amendment application to an Officer.
                    </p>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Modals */}
      <KYCUpdateModal 
        isOpen={isUpdateModalOpen} 
        onClose={() => setIsUpdateModalOpen(false)} 
        user={user}
        onUpdateSubmitted={loadActiveRequest}
      />
    </div>
  );
}
