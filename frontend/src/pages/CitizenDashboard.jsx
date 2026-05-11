import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Loader2, Wallet, AlertCircle, ArrowUpRight,
  MapPin, ExternalLink, Send, ShieldCheck, Lock
} from "lucide-react";
import { getProperties } from "../services/api";
import { getParcelsByOwner, getCurrentAccount } from "../services/blockchain";
import NewRegistrationSlideOver from "../components/NewRegistrationSlideOver";
import TransferModal from "../components/TransferModal";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

import { getImageUrl } from "../utils/media";
import { UNITS, convertArea, getUnitLabel } from "../utils/units";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import CertificateTemplate from "../components/CertificateTemplate";

/**
 * CitizenDashboard ("My Lalpurjas") — Premium gallery of digital land deeds.
 * Shows approved parcels as full-featured Lalpurja cards with land images.
 */
export default function CitizenDashboard() {
  const { user } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [activeParcel, setActiveParcel] = useState(null);
  const [viewParcel, setViewParcel] = useState(null);  // for deed detail modal
  const [areaUnit, setAreaUnit] = useState(UNITS.SQM);
  const navigate = useNavigate();
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  async function loadWalletData() {
    try {
      setLoading(true);
      setError(null);

      // 1. Discovery Phase (Blockchain First)
      const currentAddress = await getCurrentAccount();
      if (!currentAddress) {
        setParcels([]);
        return;
      }

      const chainParcels = await getParcelsByOwner(currentAddress);
      
      // 2. Metadata Phase (Production-Grade Property Registry)
      const properties = await getProperties();
      const propertyList = properties.results || properties;

      // 3. Merging Phase
      const merged = chainParcels.map(chainParcel => {
        // Find matching live metadata from Django PropertyRecords
        const meta = propertyList.find(prop => Number(prop.parcel_id) === Number(chainParcel.id));

        return {
          ...chainParcel,
          // DB Metadata
          land_image: meta?.land_image || null,
          document_path: meta?.document_path || null,
          isOrphaned: !meta, // Flag if database record is missing
          firstName: meta?.owner_details?.full_name?.split(' ')[0] || "Owner"
        };
      });

      setParcels(merged);
    } catch (err) {
      console.error("Discovery flow failed:", err);
      setError("Could not retrieve your digital deeds from the blockchain.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadWalletData(); }, []);

  const downloadCertificate = async (parcel) => {
    if (!parcel) return;
    try {
      setIsDownloading(true);
      
      // Inject print-specific styles to hide the UI and isolate the certificate
      const printStyle = document.createElement('style');
      printStyle.id = 'certificate-print-style';
      printStyle.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate-container, #printable-certificate-container * {
            visibility: visible;
          }
          #printable-certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 794px;
            height: 1123px;
            margin: 0;
            padding: 0;
          }
          @page { 
            size: A4 portrait; 
            margin: 0; 
          }
        }
      `;
      document.head.appendChild(printStyle);
      
      // Temporarily assign an ID to the certificate for printing
      if (certificateRef.current) {
        certificateRef.current.id = 'printable-certificate-container';
        
        // Remove the off-screen/invisible classes temporarily
        const originalClass = certificateRef.current.parentElement.className;
        certificateRef.current.parentElement.className = "";
        
        // Trigger native print dialog (users can 'Save as PDF')
        setTimeout(() => {
          window.print();
          
          // Cleanup after print dialog closes
          certificateRef.current.parentElement.className = originalClass;
          certificateRef.current.removeAttribute('id');
          document.getElementById('certificate-print-style').remove();
          setIsDownloading(false);
        }, 300);
      }
    } catch (err) {
      console.error("Print failed:", err);
      setIsDownloading(false);
    }
  };

  const handleTransferInit = (parcel) => {
    setActiveParcel(parcel);
    setIsTransferOpen(true);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0 hidden sm:block">
            {user?.profile_picture ? (
              <img 
                src={getImageUrl(user.profile_picture)} 
                alt="Profile" 
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-4 ring-white shadow-xl"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-xl border border-gray-100">
                <Plus size={32} />
              </div>
            )}
            {user?.is_verified && (
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <ShieldCheck size={14} className="text-white" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
              <Wallet size={14} /> Property Wallet
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">My Lalpurjas</h1>
            <p className="text-gray-400 text-sm font-medium">Your verified Digital Property Title on the blockchain.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Area Unit Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
            {Object.values(UNITS).map((u) => (
              <button
                key={u}
                onClick={() => setAreaUnit(u)}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${areaUnit === u ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {u === UNITS.SQM ? 'm²' : u}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setIsRegOpen(true)}
            disabled={user?.kyc_status !== 'Approved'}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-100 group w-full sm:w-auto"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            Apply for Registration
          </button>
        </div>
      </div>

      <NewRegistrationSlideOver
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        onSuccess={loadWalletData}
      />
      <TransferModal
        isOpen={isTransferOpen}
        parcel={activeParcel}
        onClose={() => { setIsTransferOpen(false); setActiveParcel(null); }}
        onSuccess={loadWalletData}
      />

      {/* ── Main Dashboard Content (Locked if KYC not approved) ── */}
      <div className={user?.kyc_status !== 'Approved' ? "opacity-30 pointer-events-none filter grayscale transition-all duration-1000" : ""}>
        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            <p className="text-gray-400 font-medium text-sm font-mono uppercase tracking-widest">
              Syncing with Blockchain...
            </p>
          </div>
        )}

        {!loading && (
           <>
      {/* ── Error ── */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-8 flex items-start gap-4 mx-auto max-w-2xl">
          <AlertCircle className="text-red-500 shrink-0" size={24} />
          <div className="space-y-1">
            <h4 className="font-bold text-red-900">Wallet Sync Error</h4>
            <p className="text-red-700 text-sm leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && parcels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6 bg-white border-2 border-dashed border-gray-100 rounded-[3rem] text-center">
          <div className="bg-gray-50 p-6 rounded-full mb-6">
            <Wallet className="h-12 w-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Land Deeds Found</h3>
          <p className="text-gray-500 max-w-sm mb-8 leading-relaxed text-sm">
            Your property wallet is empty. If you've recently applied, wait for officer approval.
          </p>
          <button
            onClick={() => navigate("/dashboard/applications")}
            className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-sm"
          >
            Check Application Status <ArrowUpRight size={16} />
          </button>
        </div>
      )}

      {/* ── Lalpurja Card Grid ── */}
      <AnimatePresence>
        {!loading && parcels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8"
          >
            {parcels.map((parcel, i) => (
              <motion.div
                key={parcel.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="group relative bg-[#fffdf0] border-2 border-[#e6d0a0] rounded-3xl overflow-hidden shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col"
              >
                {/* ── Land Photo Hero ── */}
                <div className="relative h-48 sm:h-52 bg-linear-to-br from-stone-100 to-amber-50 overflow-hidden shrink-0">
                  {parcel.land_image ? (
                    <img
                      src={getImageUrl(parcel.land_image)}
                      alt="Property photo"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-300">
                      <div className="p-4 bg-stone-50 rounded-full">
                        <MapPin size={32} className="text-stone-200" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Blockchain Basic Record</p>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Parcel ID badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    <span className="text-[10px] font-black text-gray-800">
                      {parcel.id ? `Parcel #${parcel.id}` : "Registered Deed"}
                    </span>
                  </div>

                  {/* Discovery Badge (If Metadata is missing) */}
                  {parcel.isOrphaned && (
                    <div className="absolute top-12 left-3 bg-red-600/90 text-white text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded shadow-sm">
                      Blockchain Discovery
                    </div>
                  )}

                  {/* View deed link (Hidden if no document) */}
                  {parcel.document_path && (
                    <a
                      href={getImageUrl(parcel.document_path)}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                      title="View Land Deed"
                    >
                      <ExternalLink size={14} className="text-blue-600" />
                    </a>
                  )}
                </div>

                {/* ── Card Body ── */}
                <div className="p-5 flex-1 flex flex-col gap-4">
                  {/* Location */}
                  <div>
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <MapPin size={10} /> Location
                    </p>
                    <p className="font-bold text-gray-900 leading-snug line-clamp-2">{parcel.location}</p>
                  </div>

                  {/* Area */}
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-gray-900">
                      {convertArea(parcel.area, areaUnit)}
                    </span>
                    <span className="text-sm font-semibold text-gray-400 mb-0.5">{getUnitLabel(areaUnit)}</span>
                  </div>

                  {/* Blockchain status */}
                  <div className="flex items-center gap-2 py-2 px-3 bg-white/70 rounded-xl border border-amber-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] shrink-0" />
                    <span className="text-[10px] font-bold text-gray-600 truncate">
                      {parcel.owner
                        ? `${parcel.owner.slice(0, 10)}...${parcel.owner.slice(-6)}`
                        : "Blockchain Verified"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button
                      onClick={() => handleTransferInit(parcel)}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-100"
                    >
                      {parcel.isLocked ? <Lock size={13} className="text-white" /> : <Send size={13} />}
                      Transfer
                    </button>
                    <button
                      onClick={() => setViewParcel(parcel)}
                      className="flex items-center justify-center gap-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 py-2.5 rounded-xl text-xs font-bold transition-all"
                    >
                      View Details
                      <ArrowUpRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Decorative corner ribbon */}
                <div className="absolute bottom-0 right-0 pointer-events-none w-16 h-16 overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-amber-200/40 rounded-full -translate-x-1/2 translate-y-1/2" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      </>
  )}
</div>

      {/* ── Deed Detail Modal ── */}
      <AnimatePresence>
        {viewParcel && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-100"
              onClick={() => setViewParcel(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-8 lg:inset-16 xl:inset-24 bg-white rounded-[2.5rem] shadow-2xl z-110 overflow-hidden flex flex-col"
            >
              {/* Modal header */}
              <div className="p-6 border-b flex items-center justify-between bg-linear-to-r from-amber-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-600 p-2.5 rounded-xl text-white"><ShieldCheck size={20} /></div>
                  <div>
                    <h2 className="font-black text-gray-900">Digital Title Record</h2>
                    <p className="text-xs text-gray-400">
                      {viewParcel.id ? `Parcel #${viewParcel.id} on BhuChain` : "Approved Deed — Parcel ID Pending"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewParcel(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                >✕</button>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Images */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Property Photo</p>
                      <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                        {viewParcel.land_image
                          ? <img src={getImageUrl(viewParcel.land_image)} alt="Land" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300"><MapPin size={40} /></div>
                        }
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Official Verification Record</p>
                      <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                        {viewParcel.document_path
                          ? <img src={getImageUrl(viewParcel.document_path)} alt="Deed" className="w-full h-full object-contain" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300"><ShieldCheck size={40} /></div>
                        }
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-black text-gray-900">Registered Information</h4>
                        <QRCodeSVG 
                          value={`${window.location.origin}/verify/${viewParcel.id}`} 
                          size={64} 
                          className="bg-white p-1 rounded-lg border border-gray-100 shadow-sm"
                        />
                      </div>
                      {[
                        { label: "Location", value: viewParcel.location },
                        { label: "Total Area", value: `${convertArea(viewParcel.area, areaUnit)} ${getUnitLabel(areaUnit)}` },
                        { label: "Parcel ID", value: viewParcel.id ? `#${viewParcel.id}` : "Pending Sync" },
                        { label: "Status", value: "Approved & Verified" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
                          <span className="text-sm font-bold text-gray-400">{label}</span>
                          <span className="font-bold text-gray-900 text-right max-w-[60%]">{value}</span>
                        </div>
                      ))}
                      {viewParcel.owner && (
                        <div className="flex justify-between items-start py-3">
                          <span className="text-sm font-bold text-gray-400">Owner Wallet</span>
                          <span className="font-mono text-xs text-gray-500 text-right break-all">{viewParcel.owner}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => downloadCertificate(viewParcel)}
                        disabled={isDownloading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-100"
                      >
                        {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                        Download Digital Certificate
                      </button>
                      <button
                        onClick={() => { setViewParcel(null); handleTransferInit(viewParcel); }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-100"
                      >
                        {viewParcel.isLocked ? <Lock size={16} /> : <Send size={16} />}
                        Initiate Ownership Transfer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CertificateTemplate 
        ref={certificateRef} 
        parcel={viewParcel} 
        user={user} 
      />
    </div>
  );
}
