import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Plus, Loader2, MapPin, Clock, 
  CheckCircle2, XCircle, ArrowRight, 
  FileText, Maximize2, AlertCircle, ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { getApplications } from "../services/api";
import { getParcelsByOwner, getCurrentAccount } from "../services/blockchain";
import { useAuth } from "../context/AuthContext";
import NewRegistrationSlideOver from "../components/NewRegistrationSlideOver";

import { getImageUrl } from "../utils/media";

const StatusBadge = ({ status }) => {
  const styles = {
    Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-50 text-rose-700 border-rose-200",
    Pending:  "bg-amber-50 text-amber-700 border-amber-200",
  };
  const icons = {
    Approved: <CheckCircle2 size={11} />,
    Rejected: <XCircle size={11} />,
    Pending:  <Clock size={11} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || styles.Pending}`}>
      {icons[status] || icons.Pending}
      {status}
    </span>
  );
};

export default function OverviewPage() {
  const [allApps, setAllApps] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegOpen, setIsRegOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      // 1. Fetch Applications from DB first (Fast)
      try {
        const appsResponse = await getApplications();
        const apps = appsResponse.results || appsResponse;
        setAllApps(Array.isArray(apps) ? apps : []);
      } catch (err) {
        console.error("Failed to fetch applications from DB:", err);
      }

      // 2. Fetch Wallet & Blockchain Data (Might be slower)
      const wallet = await getCurrentAccount();
      if (wallet) {
        const chainParcels = await getParcelsByOwner(wallet);
        
        // Use the apps we just fetched (or fetch again if needed, but safer to use local)
        const appsResponse = await getApplications();
        const apps = appsResponse.results || appsResponse;
        const approvedApps = Array.isArray(apps) ? apps.filter(a => a.status === "Approved") : [];

        // Data Aggregation (Blockchain + DB)
        const merged = chainParcels.map(chainParcel => {
          const meta = approvedApps.find(app => Number(app.parcel_id) === Number(chainParcel.id));
          return {
            ...chainParcel,
            dbAppId: meta?.id || null,
            land_image: meta?.land_image || null,
            isOrphaned: !meta
          };
        });

        setParcels(merged);
      }
    } catch (err) {
      console.error("Overview discovery flow failed:", err);
    } finally {
      setLoading(false);
    }
  }

  const pending = allApps.filter(a => a.status === "Pending");
  const rejected = allApps.filter(a => a.status === "Rejected");
  const totalArea = parcels.reduce((sum, p) => sum + (p.area || 0), 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="text-blue-600 animate-spin" />
        <p className="text-gray-400 font-medium">Syncing Registry Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {user?.profile_picture ? (
              <img 
                src={getImageUrl(user.profile_picture)} 
                alt="Profile" 
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-4 ring-white shadow-xl"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-xl border border-gray-100">
                <LayoutDashboard size={32} />
              </div>
            )}
            {user?.is_verified && (
              <div className="absolute top-0 right-0 w-6 h-6 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <ShieldCheck size={12} className="text-white" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              {greeting()}, {user?.full_name?.split(' ')[0] || 'Citizen'}
            </h1>
            <p className="text-gray-400 text-sm font-medium">Manage your land records and identity applications.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsRegOpen(true)}
            disabled={user?.kyc_status !== 'Approved'}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-blue-100 group self-start md:self-auto"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            New Land Application
          </button>
        </div>
      </div>

      {/* KYC Status Banner */}
      {user?.kyc_status !== 'Approved' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white border-2 border-blue-100 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl shadow-blue-900/5"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-blue-600 via-indigo-500 to-blue-400" />
          
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="relative inline-block">
               <div className="w-28 h-28 bg-blue-50 rounded-full flex items-center justify-center mx-auto border-2 border-blue-100">
                  <ShieldCheck className="h-14 w-14 text-blue-600" />
               </div>
               <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-2 rounded-full border-4 border-white shadow-xl animate-bounce">
                  <AlertCircle size={18} />
               </div>
            </div>

            <div className="space-y-4">
              <h2 className={`text-3xl font-black tracking-tight ${user?.kyc_status === 'Rejected' ? 'text-rose-600' : 'text-gray-900'}`}>
                {user?.kyc_status === 'Rejected' ? 'Identity Verification Rejected' : 'Identity Verification in Progress'}
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed max-w-lg mx-auto">
                {user?.kyc_status === 'Rejected' 
                  ? `Officer Remarks: "${user?.kyc_rejection_reason || 'Information provided did not match government records.'}"`
                  : 'Your government-issued documents are currently being vetted by the BhuChain Registry Officers. Full access to property management will be unlocked once your identity is confirmed.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100 min-w-[200px]">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${user?.kyc_status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                    <div className={`w-2 h-2 rounded-full ${user?.kyc_status === 'Rejected' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'}`} />
                    <span className="text-[10px] font-black uppercase">{user?.kyc_status || 'Pending'}</span>
                  </div>
               </div>
               
               {user?.kyc_status === 'Rejected' && (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Action Required</p>
                    <button 
                      onClick={() => navigate('/register')}
                      className="px-6 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                    >
                      Re-submit KYC Documents
                    </button>
                  </div>
               )}
            </div>

            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] pt-4 border-t border-gray-50">
               Registry Lock: Level 1 Identity Vetting
            </p>
          </div>
        </motion.div>
      )}

      <NewRegistrationSlideOver 
        isOpen={isRegOpen} 
        onClose={() => setIsRegOpen(false)} 
        onSuccess={loadData} 
      />

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Parcels",  value: parcels.length,   color: "blue",    icon: <MapPin size={20} /> },
          { label: "Pending Review", value: pending.length,   color: "amber",   icon: <Clock size={20} /> },
          { label: "Rejected",       value: rejected.length,  color: "rose",    icon: <XCircle size={20} /> },
          { label: "Total Area",     value: `${totalArea.toFixed(0)} m²`, color: "emerald", icon: <Maximize2 size={20} /> },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4`}
          >
            <div className={`p-3 rounded-xl bg-${s.color}-50 text-${s.color}-600 shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Approved Parcels */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Your Land Parcels
          </h2>
          {parcels.length > 0 && (
            <button
              onClick={() => navigate("/dashboard/properties")}
              className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight size={14} />
            </button>
          )}
        </div>

        {parcels.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center space-y-2">
            <MapPin className="mx-auto text-gray-300" size={36} />
            <p className="font-bold text-gray-400">No approved parcels yet</p>
            <p className="text-xs text-gray-400">Submit an application and wait for officer approval.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {parcels.map((parcel, i) => (
              <motion.div
                key={parcel.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-100 transition-all group"
              >
                {/* Land image */}
                <div className="h-36 bg-linear-to-br from-emerald-50 to-blue-50 overflow-hidden relative">
                  {parcel.land_image ? (
                    <img
                      src={getImageUrl(parcel.land_image)}
                      alt="Property"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-50">
                      <MapPin size={32} className="text-stone-200" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm z-10">
                    #{parcel.id ?? "—"}
                  </div>
                  
                  {parcel.isOrphaned && (
                    <div className="absolute bottom-2 left-2 bg-amber-500/90 text-[8px] font-black text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">
                      Blockchain Discovery
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</p>
                  <p className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">
                    {parcel.location}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-gray-500">{parcel.area} sq. m.</p>
                    {parcel.isOrphaned && <AlertCircle size={10} className="text-amber-500" title="Metadata record deleted from database" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Applications */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Recent Applications
          </h2>
          <button
            onClick={() => navigate("/dashboard/applications")}
            className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
          >
            Manage all <ArrowRight size={14} />
          </button>
        </div>

        {allApps.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center space-y-2">
            <FileText className="mx-auto text-gray-300" size={36} />
            <p className="font-bold text-gray-400">No applications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allApps.slice(0, 5).map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all group cursor-pointer"
                onClick={() => navigate("/dashboard/applications")}
              >
                {/* Status bar */}
                <div className={`w-1 self-stretch rounded-full shrink-0 ${
                  app.status === "Approved" ? "bg-emerald-500" :
                  app.status === "Rejected" ? "bg-rose-500" : "bg-amber-400"
                }`} />

                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                  {app.land_image
                    ? <img src={getImageUrl(app.land_image)} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300"><MapPin size={20} /></div>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-800 truncate">{app.location}</p>
                  <p className="text-xs text-gray-400">{app.area} m² · App #{app.id}</p>
                  {app.status === "Rejected" && app.rejection_reason && (
                    <p className="text-[11px] text-rose-500 italic mt-0.5 line-clamp-1">"{app.rejection_reason}"</p>
                  )}
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  <StatusBadge status={app.status} />
                  <p className="text-[10px] text-gray-400">
                    {new Date(app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>

                <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
