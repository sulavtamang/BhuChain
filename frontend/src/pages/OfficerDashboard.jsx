import { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,  
  RefreshCw,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ExternalLink,
  User as UserIcon,
  UserCheck,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { handleApiError } from "../utils/errorUtils";
import {
  getApplications,
  updateApplication,
  getUsers,
  approveKyc,
  rejectKyc,
} from "../services/api";

import { getImageUrl } from "../utils/media";
import {
  addParcel,
  getCurrentAccount,
  checkIsOfficer,
} from "../services/blockchain";
import {
  getKYCUpdates,
  approveKYCUpdate,
  rejectKYCUpdate,
} from "../services/api";

export default function OfficerDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("Pending");
  const [selectedApp, setSelectedApp] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isOfficerOnChain, setIsOfficerOnChain] = useState(true);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [activeTab, setActiveTab] = useState("Land"); // "Land", "KYC", or "Identity"
  const [kycProfiles, setKycProfiles] = useState([]);
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [kycLoading, setKycLoading] = useState(false);

  // Identity Updates State
  const [kycUpdates, setKycUpdates] = useState([]);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Master Admin & Blockchain Sync
  const [isContractOwner, setIsContractOwner] = useState(false);
  const [blockchainOfficers, setBlockchainOfficers] = useState([]);
  const [syncingBlockchain, setSyncingBlockchain] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchKycProfiles();
    fetchKycUpdates();
    verifyOfficerStatus();

    // Listen for account changes in MetaMask
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", verifyOfficerStatus);
    }
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", verifyOfficerStatus);
      }
    };
  }, []);

  const fetchKycUpdates = async () => {
    try {
      setUpdateLoading(true);
      const data = await getKYCUpdates();
      setKycUpdates(data.results || data);
    } catch (err) {
      console.error("Failed to fetch identity updates:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateApproval = async (id) => {
    try {
      setProcessing(true);
      await approveKYCUpdate(id);
      setSelectedUpdate(null);
      fetchKycUpdates();
      fetchKycProfiles(); // Refresh user list too
      toast.success("Identity update approved and synced.");
    } catch (err) {
      setError(handleApiError(err, "Approval failed."));
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateRejection = async (id) => {
    if (!rejectionReason) {
      // setError("Please provide a reason for rejection.");
      toast.error("Please provide a reason for rejection.");
      return;
    }
    try {
      setProcessing(true);
      await rejectKYCUpdate(id, rejectionReason);
      setSelectedUpdate(null);
      setRejectionReason("");
      fetchKycUpdates();
      toast.success("Identity update rejected.");
    } catch (err) {
      setError(handleApiError(err, "Rejection failed."));
    } finally {
      setProcessing(false);
    }
  };

  const fetchKycProfiles = async () => {
    try {
      setKycLoading(true);
      // Fetch all users and filter to only show Citizens
      const data = await getUsers();
      const allUsers = data.results || data;
      const citizensOnly = allUsers.filter((user) => user.role === "Citizen");
      setKycProfiles(citizensOnly);
    } catch (err) {
      console.error("Failed to fetch KYC profiles:", err);
    } finally {
      setKycLoading(false);
    }
  };

  const verifyOfficerStatus = async () => {
    try {
      const address = await getCurrentAccount();
      setConnectedWallet(address);
      if (address) {
        const isOfficial = await checkIsOfficer(address);
        setIsOfficerOnChain(isOfficial);

        // Also check if they are the contract owner to show management tools
        const { getReadOnlyContract } = await import("../services/blockchain");
        const contract = getReadOnlyContract();
        const owner = await contract.owner();
        const isOwner = owner.toLowerCase() === address.toLowerCase();
        setIsContractOwner(isOwner);

        if (isOwner) {
          fetchBlockchainOfficers();
        }
      }
    } catch (err) {
      console.error("Failed to verify officer status:", err);
    }
  };

  const fetchBlockchainOfficers = async () => {
    try {
      const data = await getUsers();
      const allUsers = data.results || data;
      const officers = allUsers.filter((u) => u.role === "Officer");

      const enriched = [];
      for (const off of officers) {
        const onChain = await checkIsOfficer(off.wallet_address);
        enriched.push({
          ...off,
          blockchain_status: onChain ? "Approved" : "Pending",
        });
      }
      setBlockchainOfficers(enriched);
    } catch (err) {
      console.error("Failed to fetch blockchain officers:", err);
    }
  };

  const authorizeOnBlockchain = async (walletAddress) => {
    try {
      setSyncingBlockchain(true);
      const { getContract } = await import("../services/blockchain");
      const contract = await getContract();
      const tx = await contract.addOfficer(walletAddress);

      const loadingToast = toast.loading("Writing to Blockchain Ledger...");
      await tx.wait();
      toast.dismiss(loadingToast);

      toast.success("Officer Identity Synced to Blockchain!");
      fetchBlockchainOfficers();
      verifyOfficerStatus();
    } catch (err) {
      console.error("Blockchain authorization failed:", err);
      toast.error("Permission Sync Failed. Ensure you are the Contract Owner.");
    } finally {
      setSyncingBlockchain(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getApplications();
      const sorted = (data.results || data).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
      setApplications(sorted);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError("Unable to load the application queue.");
    } finally {
      setLoading(false);
    }
  };

  // Approve Application & Register on Blockchain
  const handleApprove = async (app) => {
    if (app.status !== "Pending") return;

    // Permission Pre-flight check
    const currentAddr = await getCurrentAccount();
    const stillOfficer = await checkIsOfficer(currentAddr);
    if (!stillOfficer) {
      setError(
        "PERMISSION DENIED: Your connected wallet is not a registered Land Revenue Officer on the blockchain.",
      );
      setIsOfficerOnChain(false);
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setTxHash(null);

      // 1. BLOCKCHAIN ACTION: Call addParcel, get back receipt + the new parcel ID
      const { receipt, parcelId } = await addParcel(
        app.user_details.wallet_address,
        app.location,
        Math.floor(app.area),
      );

      setTxHash(receipt.hash);

      // 2. BACKEND ACTION: Update status AND persist the blockchain parcel_id
      if (parcelId !== null && !isNaN(parcelId)) {
        await updateApplication(app.id, {
          status: "Approved",
          parcel_id: parcelId,
          transaction_hash: receipt.hash,
          rejection_reason: rejectionReason || "Approved after verification.",
        });
      } else {
        console.error(
          "Sync failed: Transaction succeeded but Parcel ID was not found. Database not updated.",
        );
        setError(
          "CRITICAL SYNC ERROR: Land registered on blockchain but ID was not captured. Please contact support.",
        );
        setProcessing(false);
        return;
      }

      // 3. REFRESH & CLOSE
      await fetchApplications();
      setRejectionReason("");
      setSelectedApp(null);
      toast.success("Parcel successfully registered on-chain!");
    } catch (err) {
      console.error("Approval flow failed:", err);
      // Handle MetaMask user rejection gracefully (code 4001 / ACTION_REJECTED)
      if (
        err.code === 4001 ||
        err.code === "ACTION_REJECTED" ||
        err.info?.error?.code === 4001
      ) {
        setError("Transaction cancelled. No changes were made.");
      } else {
        const msg =
          err.message || "Failed to complete blockchain registration.";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setProcessing(false);
    }
  };

  // Reject Application with Reason
  const handleReject = async (app) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    // Permission Pre-flight check
    const currentAddr = await getCurrentAccount();
    const stillOfficer = await checkIsOfficer(currentAddr);
    if (!stillOfficer) {
      setError(
        "PERMISSION DENIED: Your connected wallet is not a registered Land Revenue Officer on the blockchain. You cannot reject applications.",
      );
      setIsOfficerOnChain(false);
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      await updateApplication(app.id, {
        status: "Rejected",
        rejection_reason: rejectionReason,
      });
      await fetchApplications();
      setRejectionReason("");
      setSelectedApp(null);
      toast.success("Application rejected.");
    } catch (err) {
      setError(handleApiError(err, "Failed to reject application."));
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveKyc = async (profile) => {
    try {
      setProcessing(true);
      await approveKyc(profile.id);
      await fetchKycProfiles();
      setSelectedKyc(null);
      toast.success("Citizen KYC Approved!");
    } catch (err) {
      setError("Failed to approve KYC.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectKyc = async (profile) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    try {
      setProcessing(true);
      await rejectKyc(profile.id, rejectionReason);
      await fetchKycProfiles();
      setSelectedKyc(null);
      setRejectionReason("");
      toast.success("Citizen KYC Rejected.");
    } catch (err) {
      setError(handleApiError(err, "Failed to reject KYC."));
    } finally {
      setProcessing(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const filteredApps =
    filter === "All"
      ? applications
      : applications.filter((app) => app.status === filter);

  const filteredKycProfiles =
    filter === "All"
      ? kycProfiles
      : kycProfiles.filter((p) => (p.kyc_status || "Pending") === filter);

  const filteredKycUpdates =
    filter === "All"
      ? kycUpdates
      : kycUpdates.filter((u) => (u.status || "Pending") === filter);

  const filteredBlockchainOfficers =
    filter === "All"
      ? blockchainOfficers
      : blockchainOfficers.filter((o) => o.blockchain_status === filter);

  const getRecordCount = () => {
    switch (activeTab) {
      case "Land":
        return filteredApps.length;
      case "KYC":
        return filteredKycProfiles.length;
      case "Identity":
        return filteredKycUpdates.length;
      case "Blockchain":
        return filteredBlockchainOfficers.length;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 size={40} className="text-(--primary) animate-spin" />
        <p className="text-gray-500 font-medium">Synchronizing Registry...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 sm:pt-40 px-4 sm:px-8 pb-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header & Stats Card */}
      <div className="bg-white rounded-3xl sm:rounded-4xl p-6 sm:p-8 border border-gray-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 opacity-50 blur-3xl -mr-20 -mt-20 rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-(--primary) mb-2">
              <Shield size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                BhuChain Central Command
              </span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Officer Dashboard
            </h1>
            <p className="text-gray-500 font-medium flex items-center gap-2">
              <Clock size={14} />
              Reviewing queue for official land verification.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex w-full md:w-auto gap-3 sm:gap-4">
            <div className="flex-1 md:flex-none bg-amber-50 border border-amber-100 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center">
              <span className="text-xl sm:text-2xl font-black text-amber-600 leading-none mb-1">
                {applications.filter((a) => a.status === "Pending").length}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 uppercase tracking-widest whitespace-nowrap">
                Pending
              </span>
            </div>
            <div className="flex-1 md:flex-none bg-emerald-50 border border-emerald-100 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center">
              <span className="text-xl sm:text-2xl font-black text-emerald-600 leading-none mb-1">
                {applications.filter((a) => a.status === "Approved").length}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 uppercase tracking-widest whitespace-nowrap">
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Responsive Task Switcher */}
      <div className="flex flex-col sm:flex-row bg-gray-100 p-1.5 rounded-2xl w-full lg:w-fit mb-4 gap-1">
        <button
          onClick={() => {
            setActiveTab("Land");
            setSelectedKyc(null);
          }}
          className={`flex-1 sm:flex-none px-6 sm:px-8 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === "Land" ? "bg-white text-blue-600 shadow-xl" : "text-gray-400 hover:text-gray-600"}`}
        >
          Land Apps
          {applications.filter((a) => a.status === "Pending").length > 0 && (
            <span className="bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full">
              {applications.filter((a) => a.status === "Pending").length}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab("KYC");
            setSelectedApp(null);
            setSelectedUpdate(null);
          }}
          className={`flex-1 sm:flex-none px-6 sm:px-8 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === "KYC" ? "bg-white text-blue-600 shadow-xl" : "text-gray-400 hover:text-gray-600"}`}
        >
          KYC Registry
          {kycProfiles.filter((p) => (p.kyc_status || "Pending") === "Pending")
            .length > 0 && (
            <span className="bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full">
              {
                kycProfiles.filter(
                  (p) => (p.kyc_status || "Pending") === "Pending",
                ).length
              }
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab("Identity");
            setSelectedApp(null);
            setSelectedKyc(null);
          }}
          className={`flex-1 sm:flex-none px-6 sm:px-8 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === "Identity" ? "bg-white text-blue-600 shadow-xl" : "text-gray-400 hover:text-gray-600"}`}
        >
          ID Updates
          {kycUpdates.filter((u) => (u.status || "Pending") === "Pending")
            .length > 0 && (
            <span className="bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full">
              {
                kycUpdates.filter((u) => (u.status || "Pending") === "Pending")
                  .length
              }
            </span>
          )}
        </button>
        {isContractOwner && (
          <button
            onClick={() => {
              setActiveTab("Blockchain");
              setSelectedApp(null);
              setSelectedKyc(null);
              setSelectedUpdate(null);
            }}
            className={`flex-1 sm:flex-none px-6 sm:px-8 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === "Blockchain" ? "bg-white text-blue-600 shadow-xl" : "text-gray-400 hover:text-gray-600"}`}
          >
            Blockchain Sync
            {blockchainOfficers.filter((o) => o.blockchain_status === "Pending")
              .length > 0 && (
              <span className="bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full">
                {
                  blockchainOfficers.filter(
                    (o) => o.blockchain_status === "Pending",
                  ).length
                }
              </span>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Application List - Hidden on mobile if an item is selected */}
        <div
          className={`flex-1 space-y-4 ${selectedApp || selectedKyc || selectedUpdate ? "hidden lg:block" : "block"}`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
              <div className="flex min-w-max">
                {["Pending", "Approved", "Rejected", "All"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 sm:px-5 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
                      filter === f
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
              {getRecordCount()} Records Found
            </span>
          </div>

          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {activeTab === "Land" ? (
                filteredApps.length === 0 ? (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-24 bg-gray-50/50 rounded-4xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                      <Search size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-gray-900 tracking-tight">
                        No Land Applications Found
                      </p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                        The registration queue is currently clear.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  filteredApps.map((app) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={`land-${app.id}`}
                      onClick={() => setSelectedApp(app)}
                      className={`group cursor-pointer p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all flex items-center gap-4 sm:gap-6 ${selectedApp?.id === app.id ? "bg-blue-600 border-blue-600 shadow-xl text-white" : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-lg"}`}
                    >
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-xs sm:text-sm ${selectedApp?.id === app.id ? "bg-blue-500" : "bg-gray-50 text-gray-400"}`}
                      >
                        {app.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-[9px] sm:text-[10px] font-black uppercase tracking-tighter ${selectedApp?.id === app.id ? "text-blue-200" : "text-gray-400"}`}
                        >
                          {app.user_details.full_name}
                        </span>
                        <h3 className="font-black truncate text-base sm:text-lg tracking-tight capitalize">
                          {app.location}
                        </h3>
                      </div>
                      <div className="hidden sm:flex flex-col items-end gap-1">
                        <span className="text-xs font-black tracking-tighter">
                          {app.area} m²
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedApp?.id === app.id ? "bg-blue-500 border-blue-400" : getStatusStyle(app.status)}`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <ChevronRight
                        size={20}
                        className={
                          selectedApp?.id === app.id
                            ? "text-white"
                            : "text-gray-300"
                        }
                      />
                    </motion.div>
                  ))
                )
              ) : activeTab === "KYC" ? (
                filteredKycProfiles.length === 0 ? (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-24 bg-gray-50/50 rounded-4xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                      <UserCheck size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-gray-900 tracking-tight">
                        No Citizen Profiles
                      </p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                        No registered users match your current criteria.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  filteredKycProfiles.map((profile) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={`kyc-${profile.id}`}
                      onClick={() => setSelectedKyc(profile)}
                      className={`group cursor-pointer p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all flex items-center gap-4 sm:gap-6 ${selectedKyc?.id === profile.id ? "bg-blue-600 border-blue-600 shadow-xl text-white" : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-lg"}`}
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-sm shrink-0">
                        {profile.profile_picture ? (
                          <img
                            src={getImageUrl(profile.profile_picture)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-full h-full p-2 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-[10px] font-black uppercase tracking-tighter ${selectedKyc?.id === profile.id ? "text-blue-200" : "text-gray-400"}`}
                        >
                          Citizenship: {profile.citizenship_no}
                        </span>
                        <h3 className="font-black truncate text-lg tracking-tight">
                          {profile.full_name}
                        </h3>
                      </div>
                      <div className="hidden sm:flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedKyc?.id === profile.id ? "bg-blue-500 border-blue-400" : profile.kyc_status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : profile.kyc_status === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}
                        >
                          {profile.kyc_status || "Pending"}
                        </span>
                      </div>
                      <ChevronRight
                        size={20}
                        className={
                          selectedKyc?.id === profile.id
                            ? "text-white"
                            : "text-gray-300"
                        }
                      />
                    </motion.div>
                  ))
                )
              ) : activeTab === "Identity" ? (
                filteredKycUpdates.length === 0 ? (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-24 bg-gray-50/50 rounded-4xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                      <ShieldCheck size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-gray-900 tracking-tight">
                        No Identity Updates
                      </p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                        All citizenship update requests have been processed.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  filteredKycUpdates.map((update) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={`identity-${update.id}`}
                      onClick={() => setSelectedUpdate(update)}
                      className={`group cursor-pointer p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all flex items-center gap-4 sm:gap-6 ${selectedUpdate?.id === update.id ? "bg-blue-600 border-blue-600 shadow-xl text-white" : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-lg"}`}
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-sm shrink-0">
                        {update.profile_picture ? (
                          <img
                            src={getImageUrl(update.profile_picture)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-full h-full p-2 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-[10px] font-black uppercase tracking-tighter ${selectedUpdate?.id === update.id ? "text-blue-200" : "text-gray-400"}`}
                        >
                          Current ID: {update.user_details.citizenship_no}
                        </span>
                        <h3 className="font-black truncate text-lg tracking-tight">
                          {update.full_name}
                        </h3>
                      </div>
                      <div className="hidden sm:flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedUpdate?.id === update.id ? "bg-blue-500 border-blue-400 text-white" : getStatusStyle(update.status || "Pending")}`}
                        >
                          {update.status || "Pending"}
                        </span>
                      </div>
                      <ChevronRight
                        size={20}
                        className={
                          selectedUpdate?.id === update.id
                            ? "text-white"
                            : "text-gray-300"
                        }
                      />
                    </motion.div>
                  ))
                )
              ) : /* BLOCKCHAIN SYNC VIEW */
              filteredBlockchainOfficers.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-4xl border-2 border-dashed border-gray-200">
                  <p className="font-bold text-gray-400">
                    No officers found for this status.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filter === "Pending" && (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                      <AlertCircle
                        className="text-amber-600 shrink-0"
                        size={20}
                      />
                      <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                        These officers are authorized in the database but lack
                        blockchain permissions.
                      </p>
                    </div>
                  )}
                  {filteredBlockchainOfficers.map((off) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={off.id}
                      className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border bg-white border-gray-100 flex items-center justify-between gap-4 transition-all hover:border-blue-200 hover:shadow-lg group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${off.blockchain_status === "Approved" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}
                        >
                          <Shield size={20} />
                        </div>
                        <div>
                          <h3 className="font-black text-gray-900 text-base sm:text-lg tracking-tight">
                            {off.full_name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {off.wallet_address.slice(0, 10)}...
                            </p>
                            <span
                              className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${off.blockchain_status === "Approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}
                            >
                              {off.blockchain_status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {off.blockchain_status === "Pending" ? (
                        <button
                          onClick={() =>
                            authorizeOnBlockchain(off.wallet_address)
                          }
                          disabled={syncingBlockchain}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-100"
                        >
                          {syncingBlockchain ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <RefreshCw size={12} />
                          )}
                          Sync
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                          <CheckCircle2 size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            Active
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Detail View */}
        <div className="w-full lg:w-[450px]">
          <AnimatePresence mode="wait">
            {activeTab === "Land" ? (
              !selectedApp ? (
                <motion.div
                  key="empty-land"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-300">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Select an Application
                    </h3>
                    <p className="text-sm text-gray-400">
                      Click on any request in the queue to begin verification.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`land-${selectedApp.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white rounded-4xl sm:rounded-[2.5rem] border border-gray-100 shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 flex flex-col h-fit"
                >
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="lg:hidden flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest mb-2"
                  >
                    <ChevronRight size={16} className="rotate-180" />
                    Back to Queue
                  </button>

                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Land Application #{selectedApp.id}
                    </h4>
                    <span
                      className={`text-[10px] font-black px-2 py-1 rounded-lg border ${getStatusStyle(selectedApp.status)}`}
                    >
                      {selectedApp.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden shrink-0 shadow-sm border-2 border-white">
                      {selectedApp.user_details.profile_picture ? (
                        <img
                          src={getImageUrl(
                            selectedApp.user_details.profile_picture,
                          )}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white">
                          <UserIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-gray-900 text-sm leading-tight truncate">
                        {selectedApp.user_details.full_name}
                      </span>
                      <span className="text-[10px] font-black text-gray-400 truncate tracking-tighter uppercase">
                        {selectedApp.user_details.wallet_address}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Lalpurja (Deed)
                      </p>
                      <div className="relative group rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <img
                          src={getImageUrl(selectedApp.document_path)}
                          className="w-full aspect-video object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a
                            href={getImageUrl(selectedApp.document_path)}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white p-3 rounded-full text-blue-600 shadow-xl"
                          >
                            <ExternalLink size={18} />
                          </a>
                        </div>
                      </div>
                    </div>
                    {selectedApp.land_image && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Property Photo
                        </p>
                        <div className="relative group rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                          <img
                            src={getImageUrl(selectedApp.land_image)}
                            className="w-full aspect-video object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <a
                              href={getImageUrl(selectedApp.land_image)}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-white p-3 rounded-full text-blue-600 shadow-xl"
                            >
                              <ExternalLink size={18} />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedApp.status === "Pending" ? (
                    <div className="space-y-4 pt-6 border-t">
                      <textarea
                        placeholder="Internal decision remarks..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs h-24 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex flex-col gap-2">
                          {!isOfficerOnChain && (
                            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl mb-1">
                              <AlertCircle
                                size={14}
                                className="text-rose-600 shrink-0"
                              />
                              <p className="text-[9px] text-rose-700 font-bold uppercase tracking-tight">
                                On-Chain Permission Required
                              </p>
                            </div>
                          )}
                          <button
                            onClick={() => handleApprove(selectedApp)}
                            disabled={processing || !isOfficerOnChain}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                          >
                            {processing ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={18} />
                            )}
                            Approve & Register Parcel
                          </button>
                        </div>
                        <button
                          onClick={() => handleReject(selectedApp)}
                          disabled={processing}
                          className="w-full py-4 text-rose-500 font-black text-[10px] hover:bg-rose-50 rounded-2xl uppercase tracking-widest"
                        >
                          Reject Application
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        Decision Remarks
                      </p>
                      <p className="text-xs font-bold text-gray-700 italic">
                        "
                        {selectedApp.rejection_reason || "No remarks provided."}
                        "
                      </p>
                    </div>
                  )}
                </motion.div>
              )
            ) : activeTab === "KYC" ? (
              !selectedKyc ? (
                <motion.div
                  key="empty-kyc"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-300">
                    <UserIcon size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Select a Profile
                    </h3>
                    <p className="text-sm text-gray-400">
                      Click on a citizen to review their KYC registry.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`kyc-${selectedKyc.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white rounded-4xl sm:rounded-[2.5rem] border border-gray-100 shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 flex flex-col h-fit"
                >
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setSelectedKyc(null)}
                    className="lg:hidden flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest mb-2"
                  >
                    <ChevronRight size={16} className="rotate-180" />
                    Back to Registry
                  </button>

                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Identity Record #{selectedKyc.id}
                    </h4>
                    <span
                      className={`text-[10px] font-black px-2 py-1 rounded-lg border ${selectedKyc.kyc_status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : selectedKyc.kyc_status === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}
                    >
                      {selectedKyc.kyc_status || "Pending"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden shrink-0 shadow-sm border-2 border-white">
                      {selectedKyc.profile_picture ? (
                        <img
                          src={getImageUrl(selectedKyc.profile_picture)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white">
                          <UserIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-gray-900 text-sm leading-tight truncate">
                        {selectedKyc.full_name}
                      </span>
                      <span className="text-[10px] font-black text-gray-400 truncate tracking-tighter uppercase">
                        {selectedKyc.wallet_address}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                        Phone
                      </p>
                      <p className="text-xs font-black">
                        {selectedKyc.phone_number || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                        DOB
                      </p>
                      <p className="text-xs font-black">
                        {selectedKyc.dob || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Citizenship Front
                      </p>
                      <div className="relative group rounded-2xl overflow-hidden shadow-sm border-2 border-white">
                        <img
                          src={getImageUrl(selectedKyc.citizenship_front)}
                          className="w-full aspect-3/2 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a
                            href={getImageUrl(selectedKyc.citizenship_front)}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white p-3 rounded-full text-blue-600"
                          >
                            <ExternalLink size={18} />
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Citizenship Back
                      </p>
                      <div className="relative group rounded-2xl overflow-hidden shadow-sm border-2 border-white">
                        <img
                          src={getImageUrl(selectedKyc.citizenship_back)}
                          className="w-full aspect-3/2 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a
                            href={getImageUrl(selectedKyc.citizenship_back)}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white p-3 rounded-full text-blue-600"
                          >
                            <ExternalLink size={18} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedKyc.kyc_status === "Pending" ? (
                    <div className="space-y-4 pt-6 border-t">
                      <textarea
                        placeholder="Rejection reason (visible to citizen)..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs h-24 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                      <div className="grid grid-cols-1 gap-3">
                        <button
                          onClick={() => handleApproveKyc(selectedKyc)}
                          disabled={processing}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                          {processing ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={18} />
                          )}
                          Approve Identity
                        </button>
                        <button
                          onClick={() => handleRejectKyc(selectedKyc)}
                          disabled={processing}
                          className="w-full py-4 text-rose-500 font-black text-[10px] hover:bg-rose-50 rounded-2xl uppercase tracking-widest transition-all"
                        >
                          Reject KYC
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`p-6 rounded-3xl text-center border ${selectedKyc.kyc_status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"}`}
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {selectedKyc.kyc_status === "Approved" ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <XCircle size={20} />
                        )}
                        <span className="font-black uppercase tracking-widest text-sm">
                          Status: {selectedKyc.kyc_status}
                        </span>
                      </div>
                      {selectedKyc.kyc_rejection_reason && (
                        <p className="text-xs font-bold italic opacity-70">
                          "{selectedKyc.kyc_rejection_reason}"
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )
            ) : /* IDENTITY UPDATES DETAIL VIEW */
            !selectedUpdate ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-300">
                  <RefreshCw size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    Select an Update Request
                  </h3>
                  <p className="text-sm text-gray-400">
                    Review proposed changes to citizen identity records.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`update-${selectedUpdate.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-4xl sm:rounded-[2.5rem] border border-gray-100 shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 flex flex-col h-fit"
              >
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedUpdate(null)}
                  className="lg:hidden flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest mb-2"
                >
                  <ChevronRight size={16} className="rotate-180" />
                  Back to Requests
                </button>

                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Amendment Request #{selectedUpdate.id}
                  </h4>
                  <span
                    className={`text-[10px] font-black px-2 py-1 rounded-lg border ${getStatusStyle(selectedUpdate.status || "Pending")}`}
                  >
                    {selectedUpdate.status || "Pending"}
                  </span>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden shrink-0 shadow-sm border-2 border-white">
                    {selectedUpdate.profile_picture ? (
                      <img
                        src={getImageUrl(selectedUpdate.profile_picture)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white">
                        <UserIcon size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-black text-gray-900 text-sm leading-tight truncate">
                      {selectedUpdate.full_name}
                    </span>
                    <span className="text-[10px] font-black text-gray-400 truncate tracking-tighter uppercase">
                      {selectedUpdate.user_details.wallet_address}
                    </span>
                  </div>
                </div>

                {/* Change Comparison */}
                <div className="space-y-4 pt-2">
                  <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2">
                    Proposed Changes
                  </h5>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase">
                        New Full Name
                      </p>
                      <p className="text-xs font-black text-gray-900 bg-gray-50 p-2 rounded-lg">
                        {selectedUpdate.full_name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase">
                        New ID Number
                      </p>
                      <p className="text-xs font-black text-gray-900 bg-gray-50 p-2 rounded-lg">
                        {selectedUpdate.citizenship_no}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase">
                      Updated Documents
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedUpdate.profile_picture && (
                        <div className="relative group rounded-xl overflow-hidden border border-gray-100 aspect-square">
                          <img
                            src={getImageUrl(selectedUpdate.profile_picture)}
                            className="w-full h-full object-cover"
                          />
                          <a
                            href={getImageUrl(selectedUpdate.profile_picture)}
                            target="_blank"
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                      {selectedUpdate.citizenship_front && (
                        <div className="relative group rounded-xl overflow-hidden border border-gray-100 aspect-square">
                          <img
                            src={getImageUrl(selectedUpdate.citizenship_front)}
                            className="w-full h-full object-cover"
                          />
                          <a
                            href={getImageUrl(selectedUpdate.citizenship_front)}
                            target="_blank"
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                      {selectedUpdate.citizenship_back && (
                        <div className="relative group rounded-xl overflow-hidden border border-gray-100 aspect-square">
                          <img
                            src={getImageUrl(selectedUpdate.citizenship_back)}
                            className="w-full h-full object-cover"
                          />
                          <a
                            href={getImageUrl(selectedUpdate.citizenship_back)}
                            target="_blank"
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {!selectedUpdate.status ||
                selectedUpdate.status === "Pending" ? (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 mb-2">
                      <AlertCircle
                        size={14}
                        className="text-amber-600 shrink-0"
                      />
                      <p className="text-[10px] text-amber-700 font-bold leading-tight">
                        Approving this will permanently update the citizen's
                        registry record with the new data provided above.
                      </p>
                    </div>
                    <textarea
                      placeholder="Amendment remarks or rejection reason..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-[10px] h-20 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleUpdateApproval(selectedUpdate.id)}
                        disabled={processing}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        {processing ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={12} />
                        )}{" "}
                        Apply Changes
                      </button>
                      <button
                        onClick={() => handleUpdateRejection(selectedUpdate.id)}
                        disabled={processing}
                        className="bg-rose-50 text-rose-600 hover:bg-rose-100 py-3 rounded-xl font-black text-[10px] uppercase transition-all active:scale-[0.98]"
                      >
                        Reject Update
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-6 rounded-3xl text-center border mt-4 ${selectedUpdate.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"}`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {selectedUpdate.status === "Approved" ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <XCircle size={20} />
                      )}
                      <span className="font-black uppercase tracking-widest text-sm">
                        Status: {selectedUpdate.status}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
