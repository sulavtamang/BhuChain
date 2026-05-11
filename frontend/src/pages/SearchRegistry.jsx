import { useState, useEffect } from "react";
import {
  Search,
  ShieldCheck,
  MapPin,
  Maximize2,
  History,
  ExternalLink,
  SearchCode,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Building2,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { getParcel, getParcelCount } from "../services/blockchain";
import { getProperty, getTransferHistory } from "../services/api";
import Footer from "../components/Footer";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UNITS, convertArea, getUnitLabel } from "../utils/units";

/**
 * SearchRegistry - The Public Verification Portal.
 *
 * As per the BhuChain proposal, this page allows anyone to verify
 * the "Source of Truth" for any land parcel (Kitta) in Nepal.
 */
export default function SearchRegistry() {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleStartRegistration, token } = useAuth();
  const [parcelId, setParcelId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [areaUnit, setAreaUnit] = useState(UNITS.SQM);
  const [stats, setStats] = useState({ total: 0 });

  const isDashboard = location.pathname.includes("/dashboard");

  useEffect(() => {
    // Optional: get total parcel count from blockchain on load
    const fetchStats = async () => {
      try {
        const count = await getParcelCount();
        setStats({ total: count });
      } catch (e) {
        // Stats failed
      }
    };
    fetchStats();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!parcelId) return;

    setIsSearching(true);
    setResult(null);
    setHistory([]);
    setError(null);
    try {
      // 1. Determine Search Mode (ID vs Location)
      const isNumeric = !isNaN(parcelId) && parcelId.trim() !== "";
      
      if (isNumeric) {
        // --- MODE A: PARCEL ID SEARCH (Blockchain Verified) ---
        const onChainData = await getParcel(Number(parcelId));

        if (!onChainData || !onChainData.owner || onChainData.owner === "0x0000000000000000000000000000000000000000") {
          throw new Error("No record found for this Parcel ID on the blockchain.");
        }

        let offChainData = null;
        if (token) {
          try {
            offChainData = await getProperty(Number(parcelId));
          } catch (e) { /* Metadata fetch failed */ }
        }

        setResult({
          ...onChainData,
          ownerName: offChainData?.owner_details?.full_name || null,
          timestamp: offChainData?.created_at || null,
          txHash: offChainData?.transaction_hash || null,
          isLocationSearch: false
        });

        // Fetch History
        try {
          const historyData = await getTransferHistory(Number(parcelId));
          setHistory(historyData);
        } catch (err) { /* history failed */ }

      } else {
        // --- MODE B: LOCATION SEARCH (Database Indexed) ---
        // We'll search the properties by location query
        const response = await getProperties(); // This fetches all for now, we could filter by param if backend supports it
        const allProps = response.results || response;
        const matches = allProps.filter(p => 
          p.location.toLowerCase().includes(parcelId.toLowerCase())
        );

        if (matches.length === 0) {
          throw new Error(`No properties found matching location: "${parcelId}"`);
        }

        // If many matches, we might want to show a list, but for now let's show the first one 
        // to keep the UI clean, or we could set a "resultsList" state.
        // Let's just show the first match for simplicity in this demo.
        const match = matches[0];
        setResult({
          id: match.parcel_id,
          location: match.location,
          area: match.area,
          owner: match.owner_details?.wallet_address,
          ownerName: match.owner_details?.full_name,
          timestamp: match.created_at,
          txHash: match.transaction_hash,
          isLocationSearch: true,
          matchCount: matches.length
        });
      }

    } catch (err) {
      console.error("Search failed:", err);
      const msg = err.message || "Failed to retrieve record. Please ensure the Parcel ID is correct.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      className={`bg-white ${isDashboard ? "pb-10" : "min-h-screen pt-24 pb-20"}`}
    >
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50/50 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-emerald-50/50 rounded-full blur-[100px] -z-10" />

      <div className="max-w-4xl mx-auto px-6">
        {/* Back Navigation — only shown on standalone page, not in dashboard */}
        {!isDashboard && (
          <div className="mb-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors group"
            >
              <svg
                className="h-4 w-4 group-hover:-translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-100"
          >
            <ShieldCheck size={14} />
            Immutable Registry Access
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Public Verification{" "}
            <span className="text-blue-600 underline decoration-blue-200">
              Portal
            </span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto font-medium text-sm md:text-base">
            Verify any land parcel in Nepal instantly. Our system audits the
            blockchain to ensure 100% accurate ownership history.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-emerald-400 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <form
            onSubmit={handleSearch}
            className="relative bg-white rounded-4xl border border-gray-100 shadow-2xl flex flex-col md:flex-row items-center p-2 gap-2"
          >
            <div className="flex-1 flex items-center px-4 md:px-6 w-full">
              <SearchCode
                className="text-blue-500 mr-3 md:mr-4 shrink-0"
                size={24}
              />
              <input
                type="text"
                placeholder="Enter Parcel ID (e.g. 1)..."
                value={parcelId}
                onChange={(e) => setParcelId(e.target.value)}
                className="w-full py-4 text-base md:text-lg font-bold text-gray-900 placeholder-gray-300 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="w-full md:w-auto bg-gray-900 text-white px-8 md:px-10 py-4 md:py-4 rounded-1.5rem font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:bg-gray-200 shrink-0"
            >
              {isSearching ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Search size={20} />
              )}
              Verify
            </button>
          </form>
        </div>

        {/* Stats Summary */}
        <div className="flex justify-center mt-8 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <Building2 size={12} className="text-blue-500" />
            {stats.total} Live Parcels
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <CheckCircle2 size={12} className="text-emerald-500" />
            Proof of Trust Active
          </div>
        </div>

        {/* Results Section */}
        <div className="mt-16 sm:mt-24">
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-rose-50 border border-rose-100 rounded-3xl p-10 text-center space-y-4 mb-8"
              >
                <AlertCircle className="text-rose-500 mx-auto" size={48} />
                <div>
                  <h3 className="text-lg font-black text-rose-900">
                    Record Not Found
                  </h3>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {result && !error && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-8 md:p-12 space-y-12 relative overflow-hidden"
              >
                {/* Verified Seal */}
                <div className="absolute top-0 right-0 bg-emerald-500 text-white px-10 py-2 rotate-45 translate-x-10 translate-y-6 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Verified
                  </span>
                </div>

                {/* Top Meta */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-50 pb-8">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Parcel Identity
                    </span>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                      ID #{result.id}
                      <CheckCircle2 className="text-emerald-500" size={28} />
                    </h2>
                    {result.isLocationSearch && (
                      <p className="text-[10px] font-bold text-blue-600 uppercase">
                        Found {result.matchCount} property in this location
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100 flex items-center gap-4">
                      <MapPin className="text-blue-600" size={24} />
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Geo-Registry
                        </p>
                        <p className="font-bold text-gray-900 uppercase">
                          {result.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Core Data Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-blue-50/30 p-8 rounded-2rem border border-blue-50 space-y-4 relative group">
                    <div className="p-3 bg-white rounded-2xl w-fit shadow-sm text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                      <Maximize2 size={24} />
                    </div>
                     <div>
                       <div className="flex items-center justify-between mb-1">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Calculated Area
                          </h4>
                          {/* Mini Toggle */}
                          <div className="flex bg-white/50 p-0.5 rounded-lg border border-blue-100">
                             {Object.values(UNITS).map((u) => (
                                <button
                                   key={u}
                                   onClick={() => setAreaUnit(u)}
                                   className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-md transition-all ${areaUnit === u ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                   {u === UNITS.SQM ? 'm²' : u}
                                </button>
                             ))}
                          </div>
                       </div>
                       <p className="text-2xl font-black text-gray-900">
                         {convertArea(result.area, areaUnit)}{" "}
                         <span className="text-sm font-medium text-gray-400">
                           {getUnitLabel(areaUnit)}
                         </span>
                       </p>
                     </div>
                  </div>

                  <div className="bg-emerald-50/30 p-8 rounded-2rem border border-emerald-50 space-y-4 relative group">
                    <div className="p-3 bg-white rounded-2xl w-fit shadow-sm text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                      <History size={24} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Registry Action
                      </h4>
                      {result.timestamp ? (
                        <p className="text-2xl font-black text-gray-900">
                          {new Date(result.timestamp).toLocaleDateString("en-NP")}{" "}
                          <span className="text-sm font-medium text-gray-400">
                            Minted
                          </span>
                        </p>
                      ) : (
                        <p className="text-base font-bold text-gray-400 italic">
                          Not available
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ownership Section */}
                <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white space-y-8 shadow-xl">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <Building2 size={32} className="text-blue-400" />
                      <div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          Current Legal Owner
                        </h4>
                        <p className="text-xl font-bold">
                          {result.ownerName || "Authorized Citizen"}
                        </p>
                        <code className="text-xs text-blue-300 font-mono block mt-1 opacity-60 truncate max-w-[200px] md:max-w-none">
                          {result.owner}
                        </code>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      {result.txHash && (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
                        >
                          <ShieldCheck size={16} />
                          View Blockchain Proof
                        </a>
                      )}
                      <a
                        href={`https://sepolia.etherscan.io/address/${result.owner}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-white/10"
                      >
                        Owner Wallet
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] italic text-white/50 font-medium">
                      * This ownership record is verified by a decentralized
                      network of nodes. It cannot be altered by any central
                      authority without cryptographic consent.
                    </p>
                  </div>
                </div>

                {/* Transfer History Timeline */}
                {history && history.length > 0 && (
                  <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                      <History size={24} className="text-blue-500" />
                      Ownership History
                    </h3>
                    <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[17px] before:w-0.5 before:bg-gray-100 pl-2">
                      {history.map((log, index) => {
                        const isGenesis = !log.from_user;
                        return (
                          <div key={log.id} className="relative pl-10 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${index * 100}ms` }}>
                            {/* Connector dot */}
                            <div className={`absolute left-0 top-1.5 w-8 h-8 rounded-full bg-white border-4 flex items-center justify-center -translate-x-2 z-10 shadow-sm ${isGenesis ? 'border-emerald-100' : 'border-blue-100'}`}>
                              <div className={`w-2.5 h-2.5 rounded-full ${isGenesis ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                            </div>

                            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
                              {/* Entry Header */}
                              <div className="flex justify-between items-start mb-4">
                                <div className="space-y-0.5">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    {isGenesis ? "Registration Event" : "Ownership Handover"}
                                  </p>
                                  <p className="text-xs font-bold text-gray-500">
                                    {new Date(log.timestamp).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                                  </p>
                                </div>
                                {log.sale_price && (
                                  <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 flex flex-col items-end">
                                    <span className="text-[8px] font-black uppercase tracking-widest leading-none mb-0.5">Sale Price</span>
                                    <span className="text-sm font-black">NPR {Number(log.sale_price).toLocaleString()}</span>
                                  </div>
                                )}
                              </div>

                              {/* Participants */}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                                <div className="flex-1">
                                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Previous Holder</span>
                                  {isGenesis ? (
                                    <div className="flex items-center gap-2 text-emerald-700">
                                      <ShieldCheck size={14} />
                                      <span className="text-sm font-black uppercase tracking-tight">Land Registry Office</span>
                                    </div>
                                  ) : (
                                    <div className="space-y-0.5">
                                      <p className="font-bold text-gray-900">{log.from_user_details?.full_name || "Unknown Owner"}</p>
                                      <p className="text-[10px] font-mono text-gray-400">{log.from_user_details?.wallet_address.slice(0,12)}...</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="hidden sm:flex items-center justify-center text-gray-300">
                                  <ArrowRight size={20} />
                                </div>
                                
                                <div className="flex-1">
                                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">New Legal Owner</span>
                                  <div className="space-y-0.5">
                                    <p className="font-bold text-blue-600">{log.to_user_details?.full_name || "Unknown Recipient"}</p>
                                    <p className="text-[10px] font-mono text-gray-400">{log.to_user_details?.wallet_address.slice(0,12)}...</p>
                                  </div>
                                </div>
                              </div>

                              {/* Footer Action */}
                              <div className="mt-4 pt-4 border-t border-dashed border-gray-100 flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">On-Chain Verified</span>
                                 </div>
                                 <a 
                                   href={log.transaction_hash === 'GENESIS-REGISTRATION' ? '#' : `https://sepolia.etherscan.io/tx/${log.transaction_hash}`} 
                                   target="_blank" 
                                   rel="noreferrer" 
                                   className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-tighter transition-all ${log.transaction_hash === 'GENESIS-REGISTRATION' ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-blue-100 text-blue-600 hover:bg-blue-50 shadow-xs'}`}
                                 >
                                    {log.transaction_hash === 'GENESIS-REGISTRATION' ? 'Genesis Record' : 'View Blockchain Proof'}
                                    <ExternalLink size={12} />
                                 </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!isDashboard && (
        <section className="bg-gray-50 border-y border-gray-100 py-24 mt-20">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              Ready to Secure Your{" "}
              <span className="text-blue-600">Land Identity?</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto font-medium leading-relaxed">
              Join thousands of Nepali citizens who have turned their paper
              Lalpurjas into tamper-proof digital assets on the blockchain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleStartRegistration(navigate)}
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
              >
                Apply Now
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full sm:w-auto bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>
      )}

      {!isDashboard && <Footer />}
    </div>
  );
}
