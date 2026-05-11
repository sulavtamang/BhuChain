import React, { useState, useEffect } from "react";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Maximize2, 
  Calendar,
  ChevronRight,
  Filter,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getApplications } from "../services/api";
import NewRegistrationSlideOver from "../components/NewRegistrationSlideOver";
import { getImageUrl } from "../utils/media";
import { UNITS, convertArea, getUnitLabel } from "../utils/units";

/**
 * ApplicationsPage - Displays a high-fidelity list of land registration requests
 * for the authenticated citizen.
 */
export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [selectedApp, setSelectedApp] = useState(null);
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [editApp, setEditApp] = useState(null);
  const [areaUnit, setAreaUnit] = useState(UNITS.SQM);



  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getApplications();
      // Ensure we sort by latest first
      const sorted = (data.results || data).sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setApplications(sorted);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError("Unable to load your applications. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-100 ring-rose-500";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100 ring-amber-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle2 size={14} />;
      case "Rejected":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const filteredApps = filter === "All" 
    ? applications 
    : applications.filter(app => app.status === filter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 size={40} className="text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Fetching your records...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <ClipboardList size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Registry Tracking</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Applications</h1>
          <p className="text-gray-500 font-medium">Monitor the status of your digital land registration requests.</p>
        </div>

        {/* Filters & Units */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit">
            {["All", "Pending", "Approved", "Rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  filter === f 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
            {Object.values(UNITS).map((u) => (
              <button
                key={u}
                onClick={() => setAreaUnit(u)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${areaUnit === u ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {u === UNITS.SQM ? 'm²' : u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4">
          <AlertCircle className="text-rose-500" size={24} />
          <p className="text-rose-800 font-medium">{error}</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center space-y-4">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <ClipboardList className="text-gray-400" size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">No applications found</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm">You haven't submitted any land registration requests yet.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {filteredApps.map((app, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                key={app.id}
                className="group bg-white border border-gray-100 rounded-2xl p-4 md:p-6 hover:shadow-xl hover:shadow-gray-200/50 hover:border-blue-100 transition-all flex flex-col md:flex-row md:items-center gap-6"
              >
                {/* Visual Representation */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100 relative group-hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => setSelectedApp(app)}>
                  {app.land_image ? (
                    <img src={getImageUrl(app.land_image)} alt="Land" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 group-hover:text-blue-300 transition-colors">
                      <MapPin size={32} />
                    </div>
                  )}
                  {/* Status Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    app.status === 'Approved' ? 'bg-emerald-500' : 
                    app.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                  }`} />
                </div>

                {/* Info Section */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">APP #{app.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${getStatusStyle(app.status)}`}>
                      {getStatusIcon(app.status)}
                      {app.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors capitalize">
                    {app.location || "Location Not Specified"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                      <Maximize2 size={14} className="text-gray-400" />
                      <span className="font-medium text-gray-600">{convertArea(app.area, areaUnit)}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{getUnitLabel(areaUnit)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="font-medium text-gray-600">
                        {new Date(app.created_at).toLocaleDateString("en-US", { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                  {app.status === "Rejected" && app.rejection_reason && (
                    <p className="text-[11px] text-rose-500 font-medium italic mt-2 line-clamp-1">
                      Reason: "{app.rejection_reason}"
                    </p>
                  )}
                </div>

                {/* Right Action Section */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {app.status === 'Rejected' && (
                    <button 
                      onClick={() => { setEditApp(app); setIsRegOpen(true); }}
                      className="w-full sm:w-auto px-4 py-2 text-xs font-black text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-all shadow-lg shadow-rose-100 uppercase tracking-tight"
                    >
                      Modify & Re-submit
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedApp(app)}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    View Details
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* SlideOver for Re-application */}
      <NewRegistrationSlideOver 
        isOpen={isRegOpen}
        onClose={() => { setIsRegOpen(false); setEditApp(null); }}
        initialData={editApp}
        onSuccess={fetchApplications}
      />

      {/* Footer / Tip */}
      <div className="pt-8 text-center border-t border-gray-50">
        <p className="text-xs font-medium text-gray-400 italic">
          Tip: Approved applications will automatically appear as digital deeds in your Property Wallet.
        </p>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-100"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-10 lg:inset-20 bg-white shadow-2xl rounded-[2.5rem] z-110 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 md:px-10 border-b flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Application Details</h2>
                    <p className="text-sm text-gray-500 font-medium tracking-tight">Reference ID: APP#{selectedApp.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedApp(null)}
                  className="p-3 bg-white border border-gray-100 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <XCircle size={24} className="text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="grid lg:grid-cols-2 gap-10">
                  {/* Evidence Display */}
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Official Land Deed (Lalpurja)
                      </h4>
                      <div className="aspect-4/3 bg-gray-100 rounded-4xl overflow-hidden border-4 border-white shadow-xl">
                        <img 
                          src={getImageUrl(selectedApp.document_path)} 
                          alt="Deed" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Property Photo
                      </h4>
                      <div className="aspect-4/3 bg-gray-100 rounded-4xl overflow-hidden border-4 border-white shadow-xl">
                        {selectedApp.land_image ? (
                          <img 
                            src={getImageUrl(selectedApp.land_image)} 
                            alt="Property" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-4">
                             <MapPin size={48} />
                             <p className="text-xs font-bold uppercase tracking-widest">No photo provided</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metadata Table */}
                  <div className="space-y-8">
                    <div className="bg-gray-50 rounded-4xl p-8 space-y-6">
                       <h4 className="text-sm font-black text-gray-900 mb-6">Recorded Information</h4>
                       
                       <div className="grid gap-6">
                         <div className="flex justify-between items-center py-4 border-b border-gray-100">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-tight">Location</span>
                            <span className="font-bold text-gray-900">{selectedApp.location}</span>
                         </div>
                         <div className="flex justify-between items-center py-4 border-b border-gray-100">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-tight">Total Area</span>
                            <span className="font-bold text-gray-900">{convertArea(selectedApp.area, areaUnit)} {getUnitLabel(areaUnit)}</span>
                         </div>
                         <div className="flex justify-between items-center py-4 border-b border-gray-100">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-tight">Submission Date</span>
                            <span className="font-bold text-gray-900">{new Date(selectedApp.created_at).toLocaleDateString()}</span>
                         </div>
                         <div className="flex justify-between items-center py-4">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-tight">Verification Status</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter border ${getStatusStyle(selectedApp.status)}`}>
                              {selectedApp.status}
                            </span>
                         </div>
                       </div>
                    </div>

                    <div className="p-8 bg-blue-600 rounded-4xl text-white space-y-4 shadow-xl shadow-blue-100">
                       <div className="flex items-center gap-3">
                          <AlertCircle size={20} className="text-blue-200" />
                          <h4 className="font-bold">Officer Review Policy</h4>
                       </div>
                       
                       {selectedApp.status === 'Rejected' && selectedApp.rejection_reason ? (
                         <div className="p-4 bg-rose-500/30 border border-rose-400/30 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-200 mb-1">Rejection Remarks</p>
                            <p className="text-sm font-medium italic">"{selectedApp.rejection_reason}"</p>
                            <button 
                              onClick={() => { 
                                const app = selectedApp;
                                setSelectedApp(null);
                                setEditApp(app);
                                setIsRegOpen(true);
                              }}
                              className="mt-4 w-full py-3 bg-white text-rose-600 rounded-xl text-xs font-black uppercase tracking-tight"
                            >
                              Fix & Re-submit Now
                            </button>
                         </div>
                       ) : (
                         <p className="text-sm text-blue-100 leading-relaxed">
                            {selectedApp.status === 'Approved' 
                              ? "This application has been successfully verified. You can now view your digital deed in the Property Wallet."
                              : "Your application is currently being reviewed by a government land officer. They will verify the scanned deed against existing handwritten records."}
                         </p>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
