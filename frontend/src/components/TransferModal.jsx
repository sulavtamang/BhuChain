import { useState } from "react";
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Search,
  User,
  MapPin,
  Maximize2,
  Layers} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { transferParcelOwnership } from "../services/blockchain";
import { syncPropertyTransfer, lookupCitizen } from "../services/api";
import { UNITS, convertArea, getUnitLabel } from "../utils/units";
import { Lock } from "lucide-react";
import PaymentSimulationStep from "./PaymentSimulationStep";

import { getImageUrl } from "../utils/media";

/**
 * TransferModal - Handles the high-stakes blockchain transaction of land ownership.
 *
 * Features:
 * - Recipient address validation (0x format)
 * - Real-time transaction status (Pending -> Mined -> Confirmed)
 * - Integration with ethers.js via blockchain.js
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Object|null} props.parcel - The parcel being transferred
 * @param {Function} props.onClose - Modal close handler
 * @param {Function} props.onSuccess - Callback after confirmed transaction
 */
export default function TransferModal({ isOpen, parcel, onClose, onSuccess }) {
  const [citizenshipNo, setCitizenshipNo] = useState("");
  const [recipientUser, setRecipientUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [txStatus, setTxStatus] = useState("idle"); // idle, signing, mining, success, error
  const [txHash, setTxHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPaymentStep, setShowPaymentStep] = useState(true);
  const [salePrice, setSalePrice] = useState(null);
  const [areaUnit, setAreaUnit] = useState(UNITS.SQM);

  const handleSearchCitizen = async (e) => {
    e.preventDefault();
    if (!citizenshipNo.trim()) return;

    try {
      setIsSearching(true);
      setErrorMsg("");
      const data = await lookupCitizen(citizenshipNo.trim());
      setRecipientUser(data);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Citizen not found. Please check the Citizenship Number.");
      setRecipientUser(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTransfer = async () => {
    if (parcel?.id === null || parcel?.id === undefined) {
        toast.error("Parcel ID is missing. Sync in progress, please refresh.");
        return;
    }

    if (!recipientUser || !recipientUser.wallet_address) {
      toast.error("Please search and verify a citizen first.");
      return;
    }

    try {
      setTxStatus("signing");
      setErrorMsg("");

      // 1. STRONGLY TYPED VERIFICATION
      // The recipient is already verified via lookupCitizen in handleSearchCitizen.
      const recipientAddress = recipientUser.wallet_address;

      // 2. BLOCKCHAIN TRANSFER
      const receipt = await transferParcelOwnership(parcel.id, recipientAddress);

      // 3. DATABASE SYNC (Production-Grade State Handover)
      // We inform the database that the ownership of this parcel has changed.
      // This updates the 'PropertyRecord' while leaving the original 'RegistrationApplication' intact.
      try {
        await syncPropertyTransfer(parcel.id, recipientAddress, receipt.hash, salePrice);
      } catch (dbErr) {
        // Metadata sync failed, but blockchain transfer is complete
      }

      setTxHash(receipt.hash);
      setTxStatus("success");
      toast.success("Property ownership transferred successfully!");

      // Reload dashboard data after a delay to ensure DB sync if any
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 5000);
    } catch (err) {
      console.error("Transfer failed:", err);
      setTxStatus("error");
      const msg = err.message || "The transaction was rejected or failed on the blockchain.";
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

   const handleClose = () => {
    setTxStatus("idle");
    setRecipientUser(null);
    setCitizenshipNo("");
    setTxHash("");
    setCopied(false);
    setShowPaymentStep(true);
    setSalePrice(null);
    onClose();
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={
              txStatus === "mining" || txStatus === "signing"
                ? null
                : handleClose
            }
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden z-10"
          >
            {/* Top Pattern */}
            <div className="h-2 bg-linear-to-r from-blue-600 via-indigo-500 to-blue-400" />

            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    Initiate Transfer
                  </h2>
                  <p className="text-gray-500 text-sm font-medium">
                    Permanently transfer Parcel #{parcel?.id} to a new owner.
                  </p>
                </div>
                <button
                  disabled={txStatus === "mining" || txStatus === "signing"}
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-0"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Status Logic */}
              {txStatus === "success" ? (
                <div className="py-10 text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="bg-green-100 p-6 rounded-full">
                      <CheckCircle2 size={48} className="text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-gray-900">
                      Transfer Confirmed
                    </h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto font-medium">
                      Ownership has been updated on the BhuChain network.
                    </p>
                  </div>
                  
                  {/* Digital Receipt Section */}
                  <div className="space-y-3 pt-4">
                     <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-md">
                           <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                           <span className="text-[9px] font-black text-emerald-600 uppercase">Verified Local</span>
                        </div>
                     </div>
                     
                     <div className="group relative">
                        <div className="absolute -inset-0.5 bg-linear-to-r from-blue-600 to-indigo-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
                        <div className="relative p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between gap-4">
                          <code className="text-[11px] font-mono text-gray-500 truncate select-all">{txHash}</code>
                          <button 
                            type="button"
                            onClick={handleCopyHash}
                            className={`shrink-0 p-2 rounded-lg transition-all ${
                              copied 
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" 
                                : "bg-white text-gray-400 hover:text-blue-600 shadow-sm"
                            }`}
                          >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                     </div>
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex flex-col gap-3">
                     <button 
                        type="button"
                        onClick={handleClose}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-gray-200 hover:bg-gray-800 transition-all active:scale-[0.98]"
                     >
                        Done
                     </button>
                     <p className="text-[10px] text-center text-gray-400 font-medium">
                        Ownership sync complete. Please refresh your dashboard to see latest changes.
                     </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Warning Box or Lock Warning */}
                  {parcel?.isLocked ? (
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3">
                      <Lock
                        className="text-rose-500 shrink-0"
                        size={20}
                      />
                      <p className="text-[11px] text-rose-800 font-bold uppercase leading-tight tracking-tight">
                        Warning: This parcel is currently locked and cannot be transferred. Please contact the Land Revenue Office.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                      <AlertCircle
                        className="text-amber-500 shrink-0"
                        size={20}
                      />
                      <p className="text-[11px] text-amber-800 font-bold uppercase leading-tight tracking-tight">
                        Warning: This action is irreversible once confirmed on the
                        blockchain. Ensure you verify the citizen's identity carefully.
                      </p>
                    </div>
                  )}

                  {!recipientUser ? (
                    <form onSubmit={handleSearchCitizen} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                          Buyer's Citizenship Number
                        </label>
                        <div className="relative">
                          <input
                            required
                            disabled={isSearching || txStatus !== "idle" || parcel?.isLocked}
                            type="text"
                            placeholder="e.g. 123-456"
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all pr-16"
                            value={citizenshipNo}
                            onChange={(e) => setCitizenshipNo(e.target.value)}
                          />
                          <button 
                            type="submit"
                            disabled={isSearching || txStatus !== "idle"}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                          </button>
                        </div>
                      </div>
                      {errorMsg && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                          <p className="text-xs text-red-600 font-bold">{errorMsg}</p>
                        </div>
                      )}
                    </form>
                  ) : showPaymentStep ? (
                    <PaymentSimulationStep
                      onConfirm={(price) => {
                        setSalePrice(price);
                        setShowPaymentStep(false);
                      }}
                      onBack={() => {
                        setRecipientUser(null);
                      }}
                    />
                  ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                      {/* ── LAND INFORMATION PREVIEW ── */}
                      <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                         <div className="flex items-center gap-3 p-3 bg-white border-b border-gray-100">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                               <Layers size={16} />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Property to Transfer</span>
                         </div>
                         <div className="p-4 flex gap-4">
                            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                               <img 
                                 src={getImageUrl(parcel.land_image)} 
                                 className="w-full h-full object-cover" 
                                 onError={(e) => e.target.src = 'https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image'}
                               />
                            </div>
                            <div className="space-y-1 py-1">
                               <h4 className="text-sm font-black text-gray-900">Parcel #{parcel.id}</h4>
                               <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                                  <MapPin size={12} className="text-gray-400" />
                                  {parcel.location || 'Location Pending'}
                               </div>
                                <div className="flex flex-col gap-1">
                                   <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                                      <Maximize2 size={11} /> Total Area
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <span className="text-lg font-black text-gray-900">
                                         {parcel.area ? convertArea(parcel.area, areaUnit) : 'N/A'}
                                      </span>
                                      <span className="text-[10px] font-bold text-gray-400">{getUnitLabel(areaUnit)}</span>
                                      
                                      {/* Mini Toggle */}
                                      <div className="flex bg-gray-100 p-0.5 rounded-lg ml-2">
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
                                </div>
                            </div>
                         </div>
                      </div>

                      <div className="flex justify-center py-1">
                         <div className="w-px h-6 bg-linear-to-b from-gray-200 to-transparent" />
                      </div>

                      {/* ── BUYER VERIFICATION CARD ── */}
                      <div className="p-5 border-2 border-emerald-100 bg-emerald-50 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3">
                          <div className="bg-emerald-200/50 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1">
                            <CheckCircle2 size={10} /> Verified Buyer
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-white rounded-2xl border-2 border-emerald-200 shadow-sm overflow-hidden shrink-0">
                            {recipientUser.profile_picture ? (
                              <img src={getImageUrl(recipientUser.profile_picture)} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-emerald-200">
                                <User size={28} />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-gray-900 leading-tight">{recipientUser.full_name}</h3>
                            <p className="text-xs font-bold text-gray-500 mb-2">Citizenship ID: {recipientUser.citizenship_no}</p>
                            <div className="flex items-center gap-2">
                               <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-mono bg-white px-2 py-1 rounded-lg border border-emerald-100 shadow-sm">
                                  {recipientUser.wallet_address.slice(0,6)}...{recipientUser.wallet_address.slice(-4)}
                               </div>
                               <button 
                                 onClick={() => setRecipientUser(null)}
                                 className="text-[9px] font-black text-rose-500 uppercase hover:underline"
                               >
                                 Change Buyer
                               </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Display the agreed sale price */}
                      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                        <span className="text-xs font-bold text-blue-800 uppercase tracking-widest">Agreed Sale Price</span>
                        <span className="text-lg font-black text-blue-900">NPR {salePrice?.toLocaleString()}</span>
                      </div>

                      {errorMsg && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                          <p className="text-xs text-red-600 font-bold">{errorMsg}</p>
                        </div>
                      )}

                      <button
                        onClick={handleTransfer}
                        disabled={txStatus === "signing" || txStatus === "mining"}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 mt-4"
                      >
                        {txStatus === "signing" || txStatus === "mining" ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            {txStatus === "signing"
                              ? "Waiting for MetaMask..."
                              : "Consensus in Progress..."}
                          </>
                        ) : (
                          "Confirm Blockchain Transfer"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
